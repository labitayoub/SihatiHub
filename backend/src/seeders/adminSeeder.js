import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ email: 'admin@sihati.com' });

        if (existingAdmin) {
            console.log('✅ Admin existe déjà');
            process.exit(0);
        }

        await User.create({
            firstName: 'Admin',
            lastName: 'SihatiHub',
            email: 'admin@sihati.com',
            password: await bcrypt.hash('Admin@2024', 10),
            phone: '0600000000',
            birthDate: new Date('1990-01-01'),
            address: 'Casablanca, Maroc',
            role: 'admin'
        });

        console.log('✅ Admin créé: admin@sihati.com / Admin@2024');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
};

seedAdmin();
