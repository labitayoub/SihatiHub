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
    const consultations = await Consultation.find().populate('patient doctor ordonnance analyse');
    res.status(200).json({ success: true, data: consultations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Obtenir une consultation par ID
export const getConsultationById = async (req, res) => {
  try {
    const { id } = req.params;
    const consultation = await Consultation.findById(id).populate('patient doctor ordonnance analyse');
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

// Récupérer le dossier médical d'un patient
export const getMedicalRecordByPatient = async (req, res) => {
  try {
    const { patientId } = req.params;
    const medicalRecord = await MedicalRecord.findOne({ patient: patientId })
      .populate({
        path: 'consultations',
        populate: [
          { path: 'doctor', select: 'firstName lastName specialty' },
          { path: 'ordonnance' },
          { path: 'analyse' }
        ]
      })
      .populate({ path: 'patient', select: 'firstName lastName email' });
    if (!medicalRecord) {
      return res.status(404).json({ success: false, message: 'Dossier médical non trouvé' });
    }
    res.status(200).json({ success: true, data: medicalRecord });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
