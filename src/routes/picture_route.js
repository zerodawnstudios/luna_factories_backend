import express from 'express';
import pictureController from '../controllers/picture_controller.js';
import { protect } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/factory/:factoryId', pictureController.get_factory_pictures);
router.get('/:id', pictureController.get_picture_by_id);

// Protected routes (require authentication)
// router.use(protect);

// Picture management
router.post(
  '/factory/:factoryId',
  upload.array('pictures', 10),
  pictureController.add_factory_pictures
);
router.delete(
  '/factory/:factoryId/:pictureId',
  pictureController.delete_factory_picture
);
router.delete('/:id', pictureController.delete_picture);

export default router;
