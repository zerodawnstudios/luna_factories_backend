import express from 'express';
import factoryController from '../controllers/factory_controller.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', factoryController.get_factories);
router.get('/categories', factoryController.get_factory_categories);
router.get('/:id', factoryController.get_factory_by_id);
router.get('/:id/products', factoryController.get_factory_products);
router.get('/:id/pictures', factoryController.get_factory_pictures);

// Protected routes (require authentication)
router.use(protect);

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

// Picture management for factories
router.post(
  '/:id/pictures',
  upload.array('pictures', 10),
  factoryController.add_factory_pictures
);
router.delete(
  '/:factoryId/pictures/:pictureId',
  factoryController.delete_factory_picture
);

export default router;
