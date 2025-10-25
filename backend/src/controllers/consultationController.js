import Consultation from '../models/Consultation.js';
import MedicalRecord from '../models/MedicalRecord.js';

// Créer une consultation
export const creerConsultation = async (req, res) => {
  try {
    const { date, patient, doctor, ordonnance } = req.body;
    const consultation = await Consultation.create({ date, patient, doctor, ordonnance });
    // Ajout au dossier médical
    let medicalRecord = await MedicalRecord.findOne({ patient });
    if (!medicalRecord) {
      medicalRecord = await MedicalRecord.create({ patient, consultations: [] });
    }
    medicalRecord.consultations.push(consultation._id);
    await medicalRecord.save();
    res.status(201).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir toutes les consultations
export const getConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find().populate('patient doctor ordonnance');
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir une consultation par ID
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id).populate('patient doctor ordonnance');
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Mettre à jour une consultation
export const updateConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const consultation = await Consultation.findByIdAndUpdate(id, update, { new: true });
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    res.status(200).json({ success: true, data: consultation });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Supprimer une consultation
export const deleteConsultation = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findByIdAndDelete(id);
    if (!consultation) {
      return res.status(404).json({ success: false, message: 'Consultation non trouvée' });
    }
    // Retirer la consultation du dossier médical
    await MedicalRecord.updateOne(
      { consultations: id },
      { $pull: { consultations: id } }
    );
    res.status(200).json({ success: true, message: 'Consultation supprimée' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
