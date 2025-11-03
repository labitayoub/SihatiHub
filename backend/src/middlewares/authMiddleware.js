import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authenticate = (req, res, next) => {
    try { 
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Accès non autorisé" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log(req.user);
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide" });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Accès réservé aux administrateurs" });
    }
    next();
};


export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Non authentifié" 
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Le rôle ${req.user.role} n'est pas autorisé à accéder à cette ressource`
            });
        }
        next();
    };
};

export const isDoctor = (req, res, next) => {
   
    if (req.user.role != 'medecin') {
        return res.status(403).json({ 
            success: false,
            message: "Accès réservé aux médecins" 
        });
    }
    next();
};


export const isPatient = (req, res, next) => {
    if (req.user.role != 'patient') {
        return res.status(403).json({ 
            success: false,
            message: "Accès réservé aux patients" 
        });
    }
    next();
};

export const isPharmacien = (req, res, next) => {
    if (req.user.role != 'pharmacien') {
        return res.status(403).json({ 
            success: false,
            message: "Accès réservé aux pharmaciens" 
        });
    }
    next();
};

export const isLab = (req, res, next) => {
    if (req.user.role != 'lab') {
        return res.status(403).json({ 
            success: false,
            message: "Accès réservé aux laboratoires" 
        });
    }
    next();
};