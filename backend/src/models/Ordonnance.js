import mongoose from "mongoose";

// Ordonnance Schema
const MedicamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }
});

const OrdonnanceSchema = new mongoose.Schema({
  medicaments: [MedicamentSchema],
  consultation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Consultation',
    required: true
  },
  pharmacien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['en attente', 'délivrée'],
    default: 'en attente'
  }
}, { timestamps: true });

// Export Ordonnance model
export default mongoose.model('Ordonnance', OrdonnanceSchema);