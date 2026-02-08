import express from 'express';
import personRoutes from './personRoutes';
import mtswaitRoutes from './mtswaitRoutes';

import mtsmtrRoutes from './mtsmtrRoutes';

const router = express.Router();

// Combine all routes
router.use('/api', personRoutes);
router.use('/api/mtswait', mtswaitRoutes);

router.use('/api/mtsmtr', mtsmtrRoutes);

export default router;