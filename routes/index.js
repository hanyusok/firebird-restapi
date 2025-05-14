const express = require('express');
const personRoutes = require('./personRoutes');
const mtswaitRoutes = require('./mtswaitRoutes');
const mtrRoutes = require('./mtrRoutes');

const router = express.Router();

// Combine all routes
router.use('/api', personRoutes);
router.use('/api/mtswait', mtswaitRoutes);
router.use('/api/mtr', mtrRoutes);

module.exports = router; 