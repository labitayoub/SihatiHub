import Document from '../models/Document.js';
import { 
  uploadFileToMinio, 
  deleteFileFromMinio, 
  downloadFileFromMinio,
  getFileUrl, 
  BUCKET_LAB_REPORTS, 
  BUCKET_DOCUMENTS,
  BUCKET_ORDONNANCES 
} from '../services/minioService.js';

/**
 * @desc    Créer un nouveau document (avec upload MinIO)
 * @route   POST /api/documents/create
 * @access  Private (Lab/Doctor/Admin)
 */
export const createDocument = async (req, res) => {
  try {
    console.log('📄 Creating new document...');
    console.log('  - User:', req.user?.id, req.user?.role);
    console.log('  - Body:', req.body);
    console.log('  - File:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      hasBuffer: !!req.file.buffer
    } : 'NO FILE');
    
    const { titre, type, patient, analyse, ordonnance, consultation, description, tags, isPublic } = req.body;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Aucun fichier fourni'
      });
    }

    if (!titre || !type || !patient) {
      return res.status(400).json({
        success: false,
        message: 'Titre, type et patient sont requis'
      });
    }

    // Déterminer le bucket selon le type
    let bucketName = BUCKET_DOCUMENTS;
    if (type === 'analyse') {
      bucketName = BUCKET_LAB_REPORTS;
    } else if (type === 'ordonnance') {
      bucketName = BUCKET_ORDONNANCES;
    }
    console.log('  - Selected bucket:', bucketName);

    // Upload vers MinIO
    console.log('  - Calling uploadFileToMinio...');
    const { fileName, fileUrl, bucketName: bucket } = await uploadFileToMinio(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      bucketName
    );

    // Créer le document dans MongoDB
    const documentData = {
      titre,
      type,
      fileName,
      originalName: req.file.originalname,
      fileUrl,
      bucketName: bucket,
      mimetype: req.file.mimetype,
      fileSize: req.file.size,
      patient,
      uploadedBy: req.user.id,
      description: description || '',
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      isPublic: isPublic === 'true' || isPublic === true || false
    };

    // Ajouter les références optionnelles
    if (analyse) documentData.analyse = analyse;
    if (ordonnance) documentData.ordonnance = ordonnance;
    if (consultation) documentData.consultation = consultation;

    const document = await Document.create(documentData);

    await document.populate([
      { path: 'patient', select: 'firstName lastName email role' },
      { path: 'uploadedBy', select: 'firstName lastName role' },
      { path: 'analyse', select: 'description status resultat' },
      { path: 'ordonnance', select: 'medications' },
      { path: 'consultation', select: 'date motif' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Document créé avec succès',
      data: document
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du document',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer tous les documents
 * @route   GET /api/documents
 * @access  Private
 */
export const getAllDocuments = async (req, res) => {
  try {
    const { type, patient, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (patient) query.patient = patient;

    const documents = await Document.find(query)
      .populate('patient', 'firstName lastName email role')
      .populate('uploadedBy', 'firstName lastName role')
      .populate('analyse', 'description status resultat')
      .populate('ordonnance', 'medications')
      .populate('consultation', 'date motif')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Document.countDocuments(query);

    // Régénérer les URLs signées si nécessaire
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const freshUrl = await getFileUrl(doc.bucketName, doc.fileName);
        return {
          ...doc.toObject(),
          fileUrl: freshUrl
        };
      })
    );

    res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: documentsWithUrls
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer un document par ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate('patient', 'firstName lastName email role')
      .populate('uploadedBy', 'firstName lastName role')
      .populate('analyse', 'description status resultat')
      .populate('ordonnance', 'medications')
      .populate('consultation', 'date motif');

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Générer une URL fraîche
    const freshUrl = await getFileUrl(document.bucketName, document.fileName);

    res.status(200).json({
      success: true,
      data: {
        ...document.toObject(),
        fileUrl: freshUrl
      }
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du document',
      error: error.message
    });
  }
};

/**
 * @desc    Télécharger un document directement
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📥 Downloading document:', id);

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    console.log('  - Document found:', document.fileName);
    console.log('  - Bucket:', document.bucketName);
    console.log('  - MIME type:', document.mimetype);

    // Télécharger le fichier depuis MinIO
    const fileBuffer = await downloadFileFromMinio(document.bucketName, document.fileName);

    console.log('  ✅ File downloaded from MinIO, size:', fileBuffer.length);

    // Déterminer le Content-Type (avec fallback)
    const contentType = document.mimetype || 'application/octet-stream';
    
    // Extraire l'extension du fichier original dans MinIO
    const fileExtension = document.fileName ? document.fileName.split('.').pop() : 'pdf';
    
    // Créer le nom de fichier à télécharger avec l'extension
    let downloadFileName = document.titre || 'document';
    if (!downloadFileName.includes('.')) {
      downloadFileName += `.${fileExtension}`;
    }

    console.log('  - Download filename:', downloadFileName);

    // Définir les headers pour le téléchargement
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${downloadFileName}"`);
    res.setHeader('Content-Length', fileBuffer.length);

    // Envoyer le fichier
    res.send(fileBuffer);
    console.log('  ✅ File sent to client');
  } catch (error) {
    console.error('❌ Error downloading document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du téléchargement du document',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les documents d'un patient
 * @route   GET /api/documents/user/:userId
 * @access  Private
 */
export const getDocumentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.query;

    const query = { patient: userId };
    if (type) query.type = type;

    const documents = await Document.find(query)
      .populate('uploadedBy', 'firstName lastName role')
      .populate('analyse', 'description status resultat')
      .populate('ordonnance', 'medications')
      .populate('consultation', 'date motif')
      .sort({ createdAt: -1 });

    // Régénérer les URLs
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const freshUrl = await getFileUrl(doc.bucketName, doc.fileName);
        return {
          ...doc.toObject(),
          fileUrl: freshUrl
        };
      })
    );

    res.status(200).json({
      success: true,
      count: documentsWithUrls.length,
      data: documentsWithUrls
    });
  } catch (error) {
    console.error('Error fetching user documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

/**
 * @desc    Récupérer les documents par analyse
 * @route   GET /api/documents/analyse/:analyseId
 * @access  Private
 */
export const getDocumentsByAnalyse = async (req, res) => {
  try {
    const { analyseId } = req.params;

    const documents = await Document.find({ analyse: analyseId })
      .populate('uploadedBy', 'firstName lastName role')
      .populate('patient', 'firstName lastName email')
      .sort({ createdAt: -1 });

    // Régénérer les URLs
    const documentsWithUrls = await Promise.all(
      documents.map(async (doc) => {
        const freshUrl = await getFileUrl(doc.bucketName, doc.fileName);
        return {
          ...doc.toObject(),
          fileUrl: freshUrl
        };
      })
    );

    res.status(200).json({
      success: true,
      count: documentsWithUrls.length,
      data: documentsWithUrls
    });
  } catch (error) {
    console.error('Error fetching analyse documents:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des documents',
      error: error.message
    });
  }
};

/**
 * @desc    Mettre à jour un document
 * @route   PATCH /api/documents/:id
 * @access  Private
 */
export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { titre, description, tags, isPublic } = req.body;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier les permissions
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier ce document'
      });
    }

    // Mettre à jour les métadonnées
    if (titre) document.titre = titre;
    if (description !== undefined) document.description = description;
    if (tags) document.tags = typeof tags === 'string' ? JSON.parse(tags) : tags;
    if (isPublic !== undefined) document.isPublic = isPublic === 'true' || isPublic === true;

    // Si nouveau fichier uploadé
    if (req.file) {
      // Supprimer l'ancien fichier
      await deleteFileFromMinio(document.bucketName, document.fileName);

      // Upload du nouveau
      const { fileName, fileUrl, bucketName } = await uploadFileToMinio(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        document.bucketName
      );

      document.fileName = fileName;
      document.originalName = req.file.originalname;
      document.fileUrl = fileUrl;
      document.mimetype = req.file.mimetype;
      document.fileSize = req.file.size;
    }

    await document.save();
    await document.populate([
      { path: 'patient', select: 'firstName lastName email role' },
      { path: 'uploadedBy', select: 'firstName lastName role' },
      { path: 'analyse', select: 'description status resultat' },
      { path: 'ordonnance', select: 'medications' },
      { path: 'consultation', select: 'date motif' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Document mis à jour avec succès',
      data: document
    });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du document',
      error: error.message
    });
  }
};

/**
 * @desc    Supprimer un document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document non trouvé'
      });
    }

    // Vérifier les permissions
    if (document.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer ce document'
      });
    }

    // Supprimer de MinIO
    await deleteFileFromMinio(document.bucketName, document.fileName);

    // Supprimer de MongoDB
    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Document supprimé avec succès'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du document',
      error: error.message
    });
  }
};
