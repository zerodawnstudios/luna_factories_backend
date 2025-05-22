import express from 'express';
import userController from '../controllers/user_controller.js';
import { protect } from '../middleware/auth.js'; // Import your auth middleware

const router = express.Router();

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout); // Add logout route - no protection needed

// Protected route - get current user profile
router.get('/me', protect, userController.getCurrentUser);

export default router;
