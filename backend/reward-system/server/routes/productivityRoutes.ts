import express from 'express';
import {
  getAllProductivityData,
  getProductivityDataById,
  createProductivityData,
  updateProductivityData,
  deleteProductivityData,
} from '../controllers/productivityController';

const router = express.Router();

router.get('/', getAllProductivityData);
router.get('/:id', getProductivityDataById);
router.post('/', createProductivityData);
router.put('/:id', updateProductivityData);
router.delete('/:id', deleteProductivityData);

export default router;