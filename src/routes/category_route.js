import express from 'express';
import categoryController from '../controllers/category_controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', categoryController.get_categories);
router.get('/:id', categoryController.get_category_by_id);

// Protected routes (require authentication)
router.use(protect);

// Category CRUD operations
router.post('/', categoryController.create_category);
router.put('/:id', categoryController.update_category);
router.delete('/:id', categoryController.delete_category);

export default router;
