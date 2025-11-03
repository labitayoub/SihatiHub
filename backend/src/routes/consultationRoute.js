import express from 'express';
import { authenticate, authorize, isDoctor, isPatient } from '../middlewares/authMiddleware.js';
import {
  creerConsultation,
  getConsultations,
  getConsultationById,
  updateConsultation,
  getMedicalRecordByPatient
} from '../controllers/consultationController.js';

const router = express.Router();

router.post('/', authenticate, isDoctor, creerConsultation);
router.get('/', authenticate, getConsultations);
router.get('/:id', authenticate, getConsultationById);
router.put('/:id', authenticate, isDoctor, updateConsultation);
// Ajout de l'ordonnance à une consultation (par le docteur)
router.patch('/:id/ordonnance', authenticate, isDoctor, updateConsultation);
// Route pour afficher le dossier médical d'un patient
router.get('/medical-record/:patientId', authenticate, authorize('medecin','patient'), getMedicalRecordByPatient);

export default router;
