import mongoose from "mongoose";


const analyseSchema = new mongoose.Schema({
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['en attente', 'délivrée'],
    default: 'en attente'
  },
  resultat: {
    type: String,
    required: true
  },
}, { timestamps: true });

export default mongoose.model('Analyse', analyseSchema);