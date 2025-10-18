import { register, login, createStaff } from '../services/userService.js';

export const registerController = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, birthDate, address } = req.body;
        
        const { statusCode, data } = await register({ 
            firstName, 
            lastName, 
            email, 
            password, 
            phone, 
            birthDate, 
            address 
        });
        
        res.status(statusCode).json(data);
    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur interne' });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { statusCode, data } = await login({ email, password });
        
        res.status(statusCode).json(data);
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur interne' });
    }
};

export const createStaffController = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone, birthDate, address, role, specialty } = req.body;
        
        const { statusCode, data } = await createStaff({ 
            firstName, 
            lastName, 
            email, 
            password, 
            phone, 
            birthDate, 
            address, 
            role, 
            specialty 
        });
        
        res.status(statusCode).json(data);
    } catch (error) {
        console.error('Erreur lors de la création du personnel:', error);
        res.status(500).json({ message: 'Erreur serveur interne' });
    }
};