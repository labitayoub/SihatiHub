import userModel from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Only load .env file if environment variables are not already set (not in Docker)
if (!process.env.JWT_SECRET) {
    dotenv.config();
}

export const register = async ({ firstName, lastName, email, password, phone, birthDate, address }) => {

    if (!firstName || !lastName || !phone || !birthDate || !address || !email || !password) {
        return {
            data: { message: "Tous les champs sont requis" },
            statusCode: 400
        };
    }

    if (password.length < 8) {
        return {
            data: { message: "Le mot de passe doit contenir au moins 8 caractères" },
            statusCode: 400
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            data: { message: "Format d'email invalide" },
            statusCode: 400
        };
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return {
            data: { message: "Format de numéro de téléphone invalide" },
            statusCode: 400
        };
    }

    const findUser = await userModel.findOne({ email });

    if (findUser) {
        return { 
            data: { message: "Cet email est déjà utilisé" }, 
            statusCode: 400 
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        birthDate,
        address,
        role: 'patient',
        specialty: undefined
    });

    const token = generateJWT({            
        id: newUser._id, 
        firstName: newUser.firstName, 
        lastName: newUser.lastName, 
        email: newUser.email, 
        role: newUser.role 
    });

    return { 
        data: {
            message: "Inscription réussie",
            token,
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

export const createStaff = async ({ firstName, lastName, email, password, phone, birthDate, address, role, specialty, nom }) => {

    if (!firstName || !lastName || !phone || !birthDate || !address || !role || !email || !password) {
        return {
            data: { message: "Tous les champs sont requis" },
            statusCode: 400
        };
    }

if (!['medecin', 'infirmier', 'pharmacien', 'lab'].includes(role)) {
        return {
            data: { message: "Rôle invalide. Utilisez 'medecin' ou 'infirmier'" },
            statusCode: 400
        };
    }

    if (password.length < 8) {
        return {
            data: { message: "Le mot de passe doit contenir au moins 8 caractères" },
            statusCode: 400
        };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return {
            data: { message: "Format d'email invalide" },
            statusCode: 400
        };
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        return {
            data: { message: "Format de numéro de téléphone invalide" },
            statusCode: 400
        };
    }

    if (role === 'medecin' && !specialty) {
        return {
            data: { message: "La spécialité est requise pour les médecins" },
            statusCode: 400
        };
    }
    if ((role === 'lab' || role === 'pharmacien') && !nom) {
        return {
            data: { message: "Le nom est requis pour le laboratoire ou le pharmacien" },
            statusCode: 400
        };
    }

    const findUser = await userModel.findOne({ email });
    if (findUser) {
        return { 
            data: { message: "Cet email est déjà utilisé" }, 
            statusCode: 400 
        };
    }

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
        specialty: role === 'medecin' ? specialty : undefined,
        nom: (role === 'lab' || role === 'pharmacien') ? nom : undefined
    });

    return { 
        data: {
            message:
                role === 'medecin'
                    ? 'Médecin créé avec succès'
                    : role === 'infirmier'
                    ? 'Infirmier créé avec succès'
                    : role === 'lab'
                    ? 'Laboratoire créé avec succès'
                    : role === 'pharmacien'
                    ? 'Pharmacien créé avec succès'
                    : 'Personnel créé avec succès',
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                role: newUser.role,
                ...(role === 'medecin' && { specialty: newUser.specialty }),
                ...((role === 'lab' || role === 'pharmacien') ? { nom: newUser.nom } : {})
            }
        },
        statusCode: 201
    };
};

export const login = async ({ email, password }) => {
    try {
        console.log('Login attempt for email:', email);
        
        if (!email || !password) {
            return {
                data: { message: "Email et mot de passe sont requis" },
                statusCode: 400
            };
        }

        const findUser = await userModel.findOne({ email });
        console.log('User found:', findUser ? 'Yes' : 'No');

        if (!findUser) {
            return { 
                data: { message: "Email ou mot de passe incorrect" }, 
                statusCode: 401 
            };
        }

        const passwordMatch = await bcrypt.compare(password, findUser.password);
        console.log('Password match:', passwordMatch);

        if (!passwordMatch) {
            return { 
                data: { message: "Email ou mot de passe incorrect" }, 
                statusCode: 401 
            };
        }

        const token = generateJWT({     
            id: findUser._id,
            email: findUser.email,
            firstName: findUser.firstName, 
            lastName: findUser.lastName, 
            role: findUser.role
        });

        return { 
            data: {
                message: "Connexion réussie",
                token,
                user: {
                    id: findUser._id,
                    firstName: findUser.firstName,
                    lastName: findUser.lastName,
                    email: findUser.email,
                    role: findUser.role
                }
            }, 
            statusCode: 200 
        };
    } catch (error) {
        console.error('Error in login service:', error);
        throw error;
    }
};

const generateJWT = (data) => {
    return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' })  // Token valide 24h
};
