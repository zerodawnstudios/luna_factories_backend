import express from 'express';
import factoryController from '../controllers/factory_controller.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', factoryController.get_factories);
router.get('/:id', factoryController.get_factory_by_id);
router.get('/:id/products', factoryController.get_factory_products);

// Protected routes (require authentication)
// router.use(protect);

// Factory CRUD operations
router.post('/', upload.single('mainImage'), factoryController.create_factory);
router.put(
  '/:id',
  upload.single('mainImage'),
  factoryController.update_factory
);
router.delete('/:id', factoryController.delete_factory);

// Product management for factories
router.post('/:id/products', factoryController.add_factory_product);
router.put(
  '/:factoryId/products/:productId',
  factoryController.update_factory_product
);
router.delete(
  '/:factoryId/products/:productId',
  factoryController.delete_factory_product
);

export default router;
