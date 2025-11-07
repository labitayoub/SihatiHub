import multer from 'multer';

// Configuration pour stockage en mémoire (avant upload vers MinIO)
const storage = multer.memoryStorage();

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  const allowedTypes = process.env.ALLOWED_DOCUMENT_TYPES?.split(',') || [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`), false);
  }
};

// Configuration Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '20971520') // 20MB par défaut
  }
});

export default upload;
