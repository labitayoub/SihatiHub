import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const register = async ({ firstName, lastName, email, password, phone, birthDate, address, role, specialty }) => {

    if (!firstName || !lastName || !phone || !birthDate || !address || !email || !password) {
        return {
            data: "Tous les champs sont requis",
            statusCode: 400
        };
    }

    // Forcer le rôle patient pour l'inscription publique
    const userRole = 'patient';

    if (!password) {
        return {
            data: "Le mot de passe est requis",
            statusCode: 400
        }
    }

    if (password.length < 8) {
        return {
            data: "Le mot de passe doit contenir au moins 8 caractères",
            statusCode: 400
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            data: "Format d'email invalide",
            statusCode: 400
        };
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return {
            data: "Format de numéro de téléphone invalide",
            statusCode: 400
        };
    }

    if (role === 'medecin' && !specialty) {
        return {
            data: "La spécialité est requise pour les médecins",
            statusCode: 400
        };
    }

    const findUser = await userModel.findOne({ email });

    if (findUser) return { data: "User already exists", statusCode: 400 };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        birthDate,
        address,
        role: userRole, // Toujours patient
        specialty: undefined
    });
    // await newUser.save();
    return { data: generateJWT({            
        id: newUser._id, 
            firstName: newUser.firstName, 
            lastName: newUser.lastName, 
            email: newUser.email, 
            role: newUser.role 
        }), statusCode: 201 };
};

// Nouvelle fonction pour admin
export const createStaff = async ({ firstName, lastName, email, password, phone, birthDate, address, role, specialty }) => {

    if (!firstName || !lastName || !phone || !birthDate || !address || !role || !email || !password) {
        return {
            data: "Tous les champs sont requis",
            statusCode: 400
        };
    }

    if (!['medecin', 'infirmier'].includes(role)) {
        return {
            data: "Rôle invalide. Utilisez 'medecin' ou 'infirmier'",
            statusCode: 400
        };
    }

    if (password.length < 8) {
        return {
            data: "Le mot de passe doit contenir au moins 8 caractères",
            statusCode: 400
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            data: "Format d'email invalide",
            statusCode: 400
        };
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return {
            data: "Format de numéro de téléphone invalide",
            statusCode: 400
        };
    }

    if (role === 'medecin' && !specialty) {
        return {
            data: "La spécialité est requise pour les médecins",
            statusCode: 400
        };
    }

    const findUser = await userModel.findOne({ email });
    if (findUser) return { data: "User already exists", statusCode: 400 };

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        birthDate,
        address,
        role,
        specialty: role === 'medecin' ? specialty : undefined
    });

    return { 
        data: {
            message: "Compte créé avec succès",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role
            }
        }, 
        statusCode: 201 
    };
};

export const login = async ({ email, password }) => {

    const findUser = await userModel.findOne({ email });

    if (!findUser) return { data: "User not found", statusCode: 404 };

    const passwordMatch = await bcrypt.compare(password, findUser.password);

    if (!passwordMatch) return { data: "Invalid credentials", statusCode: 401 };

    return { data: generateJWT({     
        id: findUser._id,
            email: findUser.email,
            firstName: findUser.firstName, 
            lastName: findUser.lastName, 
            role: findUser.role}), statusCode: 200 };
};

const generateJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '1h' })
};
