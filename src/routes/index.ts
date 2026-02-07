import express from 'express';
import personRoutes from './personRoutes';
import mtswaitRoutes from './mtswaitRoutes';
import mtrRoutes from './mtrRoutes';

const router = express.Router();

// Combine all routes
router.use('/api', personRoutes);
router.use('/api/mtswait', mtswaitRoutes);
router.use('/api/mtr', mtrRoutes);

export default router;