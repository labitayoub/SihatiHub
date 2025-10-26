
import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { ajouterOrdonnance } from '../controllers/ordonnanceController.js';
import { confirmerStatutOrdonnance } from '../controllers/consultationController.js';

const router = express.Router();

// Ajout d'une ordonnance à une consultation (par le médecin)
router.patch('/:consultationId/ajouter', authenticate, authorize('medecin'), ajouterOrdonnance);

// Confirmation du statut de l'ordonnance (par le pharmacien)
router.patch('/:id/confirmer-ordonnance', authenticate, authorize('pharmacien'), confirmerStatutOrdonnance);

export default router;
