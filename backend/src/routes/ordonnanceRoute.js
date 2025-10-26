import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { ajouterOrdonnance, getOrdonnancesPharmacien, confirmerStatutOrdonnance } from '../controllers/ordonnanceController.js';

const router = express.Router();

// Récupérer toutes les ordonnances liées au pharmacien connecté
router.get('/mes-ordonnances', authenticate, authorize('pharmacien'), getOrdonnancesPharmacien);

// Ajout d'une ordonnance à une consultation (par le médecin)
router.patch('/:consultationId/ajouter', authenticate, authorize('medecin'), ajouterOrdonnance);

// Confirmation du statut de l'ordonnance (par le pharmacien)
router.patch('/:id/confirmer-ordonnance', authenticate, authorize('pharmacien'), confirmerStatutOrdonnance);

export default router;
