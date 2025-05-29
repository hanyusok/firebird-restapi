const express = require('express');
const router = express.Router();
const personService = require('../services/personService');
const { logError, logInfo, logHttp, logWarn } = require('../utils/logger');

// Add request logging middleware
router.use((req, res, next) => {
    const start = Date.now();
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    
    // Log response when it's finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

// GET all persons with pagination
router.get('/persons', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        logHttp(`GET /persons - Page: ${page}, Limit: ${limit}`);
        
        const result = await personService.getAllPersons(page, limit);
        logInfo('Successfully retrieved persons', { page, limit, count: result.data.length });
        res.json(result);
    } catch (error) {
        logError('Error in GET /persons', { error: error.message, stack: error.stack });
        res.status(500).json({ error: error.message });
    }
});

// Search persons by query parameters
router.get('/persons/search', async (req, res) => {
    try {
        const { pname, pcode, searchId } = req.query;
        logHttp('GET /persons/search', { pname, pcode, searchId });

        if (pname) {
            const result = await personService.getByName(pname);
            // Always return 200 with an array, even if empty
            return res.json(result || []);
        }

        if (pcode) {
            const result = await personService.getByPcode(parseInt(pcode));
            // Always return 200 with an array, even if empty
            return res.json(result || []);
        }

        if (searchId) {
            const result = await personService.getBySearchId(searchId);
            // Always return 200 with an array, even if empty
            return res.json(result || []);
        }

        logWarn('Missing search parameters', { query: req.query });
        return res.status(400).json({ error: 'Either pname, pcode, or searchId is required' });
    } catch (error) {
        logError('Error in GET /persons/search', { 
            query: req.query, 
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ error: error.message });
    }
});

// Get person by PCODE
router.get('/persons/:pcode', async (req, res) => {
    try {
        const pcode = parseInt(req.params.pcode);
        logHttp(`GET /persons/:pcode - PCODE: ${pcode}`);
        
        const result = await personService.getByPcode(pcode);
        if (!result || result.length === 0) {
            logWarn('No person found with PCODE', { pcode });
            return res.status(404).json({ error: 'No person found with that pcode' });
        }
        
        logInfo('Successfully retrieved person by PCODE', { pcode });
        res.json(result);
    } catch (error) {
        logError('Error in GET /persons/:pcode', { 
            pcode: req.params.pcode, 
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ error: error.message });
    }
});

// Create a new person
router.post('/persons', async (req, res) => {
    try {
        const personData = req.body;
        logHttp('POST /persons', { personData: { ...personData, PNAME: personData.PNAME ? '***' : null } });
        
        // Remove PCODE and FCODE from request if provided
        delete personData.PCODE;
        delete personData.FCODE;
        
        // Get last codes and generate new ones
        console.log('Getting last codes for new person');
        const lastCodes = await personService.getLastCodes();
        console.log('Retrieved last codes:', lastCodes);
        
        // Generate new codes
        personData.PCODE = (lastCodes.PCODE || 0) + 1;  // Increment by 1 if null, start from 1
        personData.FCODE = (lastCodes.FCODE || 0) + 1;  // Increment by 1 if null, start from 1
        console.log('Generated new codes:', { PCODE: personData.PCODE, FCODE: personData.FCODE });

        if (!personData.PCODE) {
            logWarn('No PCODE available for person creation');
            return res.status(400).json({ error: 'PCODE is required and could not be obtained from LAST table' });
        }

        console.log('Creating person with data:', { ...personData, PNAME: personData.PNAME ? '***' : null });
        const result = await personService.createPerson(personData);
        logInfo('Successfully created new person', { pcode: result.PCODE, fcode: result.FCODE });
        res.status(201).json(result);
    } catch (error) {
        logError('Error in POST /persons', { 
            personData: { ...req.body, PNAME: req.body.PNAME ? '***' : null }, 
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ error: error.message });
    }
});

// Update a person by PCODE
router.put('/persons/:pcode', async (req, res) => {
    try {
        const pcode = parseInt(req.params.pcode);
        const personData = req.body;
        logHttp(`PUT /persons/:pcode - PCODE: ${pcode}`, { personData: { ...personData, PNAME: personData.PNAME ? '***' : null } });
        
        if (!pcode) {
            logWarn('Missing PCODE in update request');
            return res.status(400).json({ error: 'PCODE is required' });
        }

        const result = await personService.updatePerson(pcode, personData);
        logInfo('Successfully updated person', { pcode });
        res.json(result);
    } catch (error) {
        logError('Error in PUT /persons/:pcode', { 
            pcode: req.params.pcode, 
            personData: { ...req.body, PNAME: req.body.PNAME ? '***' : null },
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ error: error.message });
    }
});

// Delete a person by PCODE
router.delete('/persons/:pcode', async (req, res) => {
    try {
        const pcode = parseInt(req.params.pcode);
        logHttp(`DELETE /persons/:pcode - PCODE: ${pcode}`);
        
        if (!pcode) {
            logWarn('Missing PCODE in delete request');
            return res.status(400).json({ error: 'PCODE is required' });
        }

        const result = await personService.deletePerson(pcode);
        logInfo('Successfully deleted person', { pcode });
        res.json(result);
    } catch (error) {
        logError('Error in DELETE /persons/:pcode', { 
            pcode: req.params.pcode, 
            error: error.message, 
            stack: error.stack 
        });
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 