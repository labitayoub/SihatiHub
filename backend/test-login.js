import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import { login } from './src/services/userService.js';

dotenv.config();

const testLogin = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();
        console.log('Database connected successfully');

        console.log('\nTesting login...');
        const result = await login({
            email: 'admin@sihati.com',
            password: 'Admin@2024'
        });

        console.log('Login result:', JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

testLogin();
