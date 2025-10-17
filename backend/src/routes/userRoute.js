import express from 'express';
import { register, login, createStaff } from '../services/userService.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';


const router = express.Router();

// Inscription patient (public)
router.post('/register', async (req, res) => {
    const { firstName, lastName, email, password, phone, birthDate, address } = req.body;
    const { statusCode, data } = await register({ firstName, lastName, email, password, phone, birthDate, address });
    res.status(statusCode).send(data);
});

// Connexion (public)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const { statusCode, data } = await login({ email, password });
    res.status(statusCode).send(data);
});

// Création médecin/infirmier (admin seulement)
router.post('/create-staff', authenticate, isAdmin, async (req, res) => {
    const { firstName, lastName, email, password, phone, birthDate, address, role, specialty } = req.body;
    const { statusCode, data } = await createStaff({ firstName, lastName, email, password, phone, birthDate, address, role, specialty });
    res.status(statusCode).send(data);
});

export default router;