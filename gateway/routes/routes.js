// routes.js
import express from 'express';
import { userRoutes } from './userRoutes.js';
// import { productRoutes } from './productRoutes.js';
// import { orderRoutes } from './orderRoutes.js';
// import { authMiddleware } from '../auth/auth.js';

const router = express.Router();

router.use('/users', userRoutes); // this creates /api/users/login

export { router };
