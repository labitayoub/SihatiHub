import express from 'express';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { getAnalysesLab, confirmerStatutAnalyse } from '../controllers/analyseController.js';


const router = express.Router();

// Récupérer toutes les analyses du laboratoire connecté
router.get('/lab', authenticate, authorize(['lab']), getAnalysesLab);

// Confirmer le statut et le résultat d'une analyse
router.patch('/:id/confirmer', authenticate, authorize(['lab']), confirmerStatutAnalyse);

export default router;
