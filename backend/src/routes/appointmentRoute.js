import express from 'express';
import {
  definirHoraires,
  obtenirHoraires,
  voirCreneauxDisponibles,
  reserverRendezVous,
  mesRendezVous,
  confirmerRendezVous,
  annulerRendezVous,
  peutReserver
} from '../controllers/appointmentController.js';
import { authenticate, authorize, isDoctor, isPatient } from '../middlewares/authMiddleware.js';
import { 
  validateAppointment, 
  validateSchedule, 
  validateAvailableSlots, 
  validateMyAppointments 
} from '../middlewares/validateMiddleware.js';

const router = express.Router();

router.get('/horaires/:doctorId', obtenirHoraires);

// ========== ROUTES PROTÉGÉES - MÉDECIN ==========
// Définir les horaires (réservé aux médecins)
router.post('/horaires', authenticate, isDoctor, validateSchedule, definirHoraires);

// Confirmer un rendez-vous (réservé aux médecins)
router.patch('/:id/confirmer', authenticate, isDoctor, confirmerRendezVous);

// ========== ROUTES PROTÉGÉES - PATIENT ==========
// Vérifier si un patient peut réserver avec un médecin
router.get('/peut-reserver/:doctorId/:patientId', authenticate, peutReserver);

// Voir les créneaux disponibles (authentification requise)
router.get('/disponibles', authenticate, validateAvailableSlots, voirCreneauxDisponibles);

// Réserver un rendez-vous (réservé aux patients)
router.post('/reserver', authenticate, isPatient, validateAppointment, reserverRendezVous);

// ========== ROUTES PROTÉGÉES - MÉDECIN OU PATIENT ==========
// Voir ses rendez-vous (médecin ou patient)
router.get('/mes-rendez-vous', authenticate, validateMyAppointments, mesRendezVous);

// Annuler un rendez-vous (médecin ou patient)
router.delete('/:id/annuler', authenticate, annulerRendezVous);

export default router;
