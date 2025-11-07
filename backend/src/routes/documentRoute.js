import express from 'express';
import {
  createDocument,
  getAllDocuments,
  getDocumentById,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getDocumentsByUser,
  getDocumentsByAnalyse
} from '../controllers/documentController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// Créer un document (Lab/Doctor/Admin)
router.post(
  '/create', 
  authenticate, 
  authorize('lab', 'medecin', 'admin'), 
  upload.single('file'), 
  createDocument
);

// Récupérer tous les documents
router.get('/', authenticate, getAllDocuments);

// Télécharger un document directement (AVANT /:id pour éviter les conflits)
router.get(
  '/:id/download', 
  authenticate, 
  authorize('lab', 'medecin', 'admin'), 
  downloadDocument
);

// Récupérer un document par ID
router.get('/:id', authenticate, getDocumentById);

// Récupérer les documents d'un patient
router.get('/user/:userId', authenticate, getDocumentsByUser);

// Récupérer les documents par analyse
router.get('/analyse/:analyseId', authenticate, getDocumentsByAnalyse);

// Mettre à jour un document
router.patch(
  '/:id', 
  authenticate, 
  authorize('lab', 'medecin', 'admin'), 
  upload.single('file'), 
  updateDocument
);

// Supprimer un document
router.delete(
  '/:id', 
  authenticate, 
  authorize('lab', 'medecin', 'admin'), 
  deleteDocument
);

export default router;
