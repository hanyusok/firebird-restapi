const express = require('express');
const router = express.Router();
const MtrService = require('../services/mtrService');

// Get all records
router.get('/', async (req, res) => {
    try {
        const records = await MtrService.getAll();
        res.json(records);
    } catch (error) {
        console.error('Error fetching records:', error);
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
        // Convert YYYYMMDD to YYYY-MM-DDT00:00:00.000Z
        const formattedDate = `${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}T00:00:00.000Z`;
        const records = await MtrService.getByVisidate(formattedDate);
        if (!records || records.length === 0) {
            return res.status(404).json({ error: 'No records found for this date' });
        }
        res.json(records);
    } catch (error) {
        console.error('Error fetching records by date:', error);
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
        console.error('Error fetching record:', error);
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
        console.error('Error creating record:', error);
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
        console.error('Error updating record:', error);
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
        console.error('Error deleting record:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
});

module.exports = router; 