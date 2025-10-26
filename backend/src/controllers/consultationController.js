// Confirmer le statut de l'ordonnance (par le pharmacien)
export const confirmerStatutOrdonnance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // On ne modifie que le champ 'status' de l'ordonnance liée à la consultation
    const consultation = await Consultation.findById(id).populate('ordonnance');
    if (!consultation || !consultation.ordonnance) {
      return res.status(404).json({ success: false, message: 'Consultation ou ordonnance non trouvée' });
    }
    consultation.ordonnance.status = status;
    await consultation.ordonnance.save();
    res.status(200).json({ success: true, data: consultation.ordonnance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
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
