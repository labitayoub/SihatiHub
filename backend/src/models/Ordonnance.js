import mongoose from "mongoose";

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
    enum: ['en attente', 'délivrée', 'annulée'],
    default: 'en attente'
  }
}, { timestamps: true });

export default mongoose.model('Ordonnance', OrdonnanceSchema);