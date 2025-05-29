const express = require('express');
const router = express.Router();
const MtrService = require('../services/mtrService');
const { logError } = require('../utils/logger');
const { convertToLocalTime } = require('../utils/koreanUtils');

// Get all records
router.get('/', async (req, res) => {
    try {
        const records = await MtrService.getAll();
        res.json(records);
    } catch (error) {
        logError('Error fetching records', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Get records by VISIDATE
router.get('/date/:visidate', async (req, res) => {
    try {
        const { visidate } = req.params;
        // Use convertToLocalTime utility for date formatting
        const formattedDate = convertToLocalTime(`${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}`);
        const records = await MtrService.getByVisidate(formattedDate);
        // Always return 200 with an array, even if empty
        res.json(records || []);
    } catch (error) {
        logError('Error fetching records by date', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Get record by PCODE
router.get('/:pcode', async (req, res) => {
    try {
        const record = await MtrService.getByPcode(req.params.pcode);
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(record);
    } catch (error) {
        logError('Error fetching record', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Create new record
router.post('/', async (req, res) => {
    try {
        const result = await MtrService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        logError('Error creating record', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Update record
router.put('/:pcode', async (req, res) => {
    try {
        const result = await MtrService.update(req.params.pcode, req.body);
        if (!result) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json(result);
    } catch (error) {
        logError('Error updating record', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

// Delete record
router.delete('/:pcode', async (req, res) => {
    try {
        const result = await MtrService.delete(req.params.pcode);
        if (!result) {
            return res.status(404).json({ error: 'Record not found' });
        }
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        logError('Error deleting record', { error: error.message, stack: error.stack });
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 