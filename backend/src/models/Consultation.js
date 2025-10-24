import mongoose from "mongoose";

const ConsultationSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ordonnance: { type: mongoose.Schema.Types.ObjectId, ref: 'Ordonnance' }
}, { timestamps: true });

export default mongoose.model('Consultation', ConsultationSchema);