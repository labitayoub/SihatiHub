import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import {
  creerConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  getMedicalRecordByPatient
} from '../controllers/consultationController.js';

const router = express.Router();

router.post('/', creerConsultation);
router.get('/', getConsultations);
router.get('/:id', getConsultationById);
router.put('/:id', updateConsultation);
// Ajout de l'ordonnance à une consultation (par le docteur)
router.patch('/:id/ordonnance', authenticate, authorize('medecin'), updateConsultation);
// Confirmation du statut de l'ordonnance (par le pharmacien)

// Route pour afficher le dossier médical d'un patient
router.get('/medical-record/:patientId', getMedicalRecordByPatient);

export default router;
