const express = require('express');
const personRoutes = require('./personRoutes');

const router = express.Router();

// Combine all routes
router.use('/api', personRoutes);

module.exports = router; 