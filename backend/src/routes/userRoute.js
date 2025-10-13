import express from 'express';
import {register, login} from '../services/userService.js';


const router = express.Router();

router.post('/register', async (req,res) => {
    const { firstName, lastName, email, password, phone, birthDate, address, specialty } = req.body;
const {statusCode, data} = await register({ firstName, lastName, email, password, phone, birthDate, address, specialty });
res.status(statusCode).send(data)
});


export default router;