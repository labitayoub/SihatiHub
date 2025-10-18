import express from 'express';
import { registerController, loginController, createStaffController } from '../controllers/userController.js';
import { authenticate, isAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();


router.post('/register/patient', registerController); 
router.post('/login', loginController);         

router.post('/register/staff', authenticate, isAdmin, createStaffController);

export default router;