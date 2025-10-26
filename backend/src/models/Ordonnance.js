import mongoose from "mongoose";

const MedicamentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true }
});

const OrdonnanceSchema = new mongoose.Schema({
  pharmacien: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  medicaments: [MedicamentSchema],
  status: { type: String, default: 'en attente' }

});

export default mongoose.model('Ordonnance', OrdonnanceSchema);