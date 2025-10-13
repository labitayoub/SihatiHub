import userModel from "../models/User.js";
import bcrypt from "bcryptjs";

export const register = async ({ firstName, lastName, email, password, phone, birthDate, address, role, specialty }) => {

    const findUser = await userModel.findOne({ email });

    if (findUser) return { data: "User already exists", statusCode: 400 };

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

    if (!firstName || !lastName || !phone || !birthDate || !address || !role || !specialty) {
        return {
            data: "Tous les champs sont requis",
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({ 
        firstName, 
        lastName, 
        email, 
        password: hashedPassword,
        phone,
        birthDate,
        address,
        role,
        specialty
    });

    return { data: user, statusCode: 201 };
};

export const login = async ({ email, password }) => {

    const user = await userModel.findOne({ email });

    if (!user) return { data: "User not found", statusCode: 404 };

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return { data: "Invalid credentials", statusCode: 401 };

    return { data: user, statusCode: 200 };
};