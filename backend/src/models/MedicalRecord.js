import mongoose from "mongoose";

const MedicalRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // référence au patient
  consultations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' }] // tableau de consultations
}, { timestamps: true });

export default mongoose.model('MedicalRecord', MedicalRecordSchema);