// Imports
import express from 'express';
import { userRoutes } from './userRoutes.js';
import { productRoutes } from './productRoutes.js';
import { orderRoutes } from './orderRoutes.js';
// import { authMiddleware } from '../auth/auth.js';

// Initialize a router
const router = express.Router();

// Use routes as per the request received
router.use('/users', userRoutes); 
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);

export { router };
