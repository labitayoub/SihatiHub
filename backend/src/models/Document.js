import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['analyse', 'ordonnance', 'consultation', 'autre'],
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  bucketName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  // Référence à une analyse (si le document est un résultat d'analyse)
  analyse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Analyse'
  },
  // Référence à une ordonnance
  ordonnance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ordonnance'
  },
  // Référence à une consultation
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation'
  },
  // Patient concerné par le document
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Personne qui a uploadé le document (lab, médecin, etc.)
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tags: [{
    type: String
  }],
  // Visibilité du document
  isPublic: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index pour recherche rapide
documentSchema.index({ patient: 1, type: 1 });
documentSchema.index({ analyse: 1 });
documentSchema.index({ ordonnance: 1 });
documentSchema.index({ consultation: 1 });
documentSchema.index({ uploadedBy: 1 });

export default mongoose.model('Document', documentSchema);
