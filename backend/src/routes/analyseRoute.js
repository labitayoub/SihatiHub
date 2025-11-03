import express from 'express';
import { authenticate, isDoctor, isLab } from '../middlewares/authMiddleware.js';
import { getAnalysesLab, confirmerStatutAnalyse, ajouterAnalyse } from '../controllers/analyseController.js';
import { validateAnalyse } from '../middlewares/validateMiddleware.js';


const router = express.Router();

// Récupérer toutes les analyses du laboratoire connecté
router.get('/lab', authenticate, isLab, getAnalysesLab);

// Confirmer le statut et le résultat d'une analyse
router.patch('/:id/confirmer', authenticate, isLab, confirmerStatutAnalyse);

// Ajouter une analyse à une consultation (par le médecin)
router.post('/consultation/:consultationId', authenticate, isDoctor, validateAnalyse, ajouterAnalyse);

export default router;
