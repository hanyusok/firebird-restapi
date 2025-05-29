const express = require('express');
const router = express.Router();
const mtswaitService = require('../services/mtswaitService');
const { logError } = require('../utils/logger');
const { convertToLocalTime } = require('../utils/koreanUtils');

// Get by VISIDATE
router.get('/date/:visidate', async (req, res) => {
  try {
    const { visidate } = req.params;
    // Use convertToLocalTime utility for date formatting
    const formattedDate = convertToLocalTime(`${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}`);
    const data = await mtswaitService.getByVisitDate(formattedDate);
    if (!data || data.length === 0) return res.status(404).json({ error: 'No records found for this date' });
    res.json(data);
  } catch (err) {
    logError('Error fetching mtswait records by date', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

// Create
router.post('/', async (req, res) => {
  try {
    await mtswaitService.create(req.body);
    res.status(201).json({ message: 'Created' });
  } catch (err) {
    logError('Error creating mtswait record', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

// Update
router.put('/:pcode/:visidate', async (req, res) => {
  try {
    const { pcode, visidate } = req.params;
    await mtswaitService.update(pcode, visidate, req.body);
    res.json({ message: 'Updated' });
  } catch (err) {
    logError('Error updating mtswait record', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

// Delete
router.delete('/:pcode/:visidate', async (req, res) => {
  try {
    const { pcode, visidate } = req.params;
    await mtswaitService.delete(pcode, visidate);
    res.json({ message: 'Deleted' });
  } catch (err) {
    logError('Error deleting mtswait record', { error: err.message, stack: err.stack });
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;