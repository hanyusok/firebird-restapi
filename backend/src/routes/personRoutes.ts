import express, { Request, Response, NextFunction } from 'express';
import personService from '../services/personService';
import { logError, logInfo, logHttp, logWarn } from '../utils/logger';
import validate from '../middleware/validate';
import {
    createPersonSchema,
    updatePersonSchema,
    getPersonSchema,
    searchPersonSchema
} from '../schemas/personSchema';

const router = express.Router();

interface CustomRequest extends Request {
    // Add custom properties if needed, but standard Request is fine for now
}

// Add request logging middleware
router.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    // console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

    // Log response when it's finished
    res.on('finish', () => {
        const duration = Date.now() - start;
        // console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Person:
 *       type: object
 *       properties:
 *         PCODE:
 *           type: integer
 *           description: Person Code (Primary Key)
 *         PNAME:
 *           type: string
 *           description: Person Name
 *         PBIRTH:
 *           type: string
 *           format: date
 *           description: Birthdate
 *         # Add other fields as necessary
 */

/**
 * @swagger
 * /api/persons:
 *   get:
 *     summary: Get all persons with pagination
 *     tags: [Persons]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of persons
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
 *                 pagination:
 *                   type: object
 */
router.get('/persons', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        logHttp(`GET /persons - Page: ${page}, Limit: ${limit}`);

        const result = await personService.getAllPersons(page, limit);
        logInfo('Successfully retrieved persons', { page, limit, count: result.data.length });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/persons/search:
 *   get:
 *     summary: Search persons
 *     tags: [Persons]
 *     parameters:
 *       - in: query
 *         name: pname
 *         schema:
 *           type: string
 *       - in: query
 *         name: pcode
 *         schema:
 *           type: integer
 *       - in: query
 *         name: searchId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/persons/search', validate(searchPersonSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { pname, pbirth, pcode, searchId } = req.query;
        logHttp('GET /persons/search', { pname, pbirth, pcode, searchId });

        // Handle PCODE search (highest priority, unique)
        if (pcode) {
            const result = await personService.getByPcode(parseInt(pcode as string));
            return res.json(result || []);
        }

        // Handle SearchID (unique)
        if (searchId) {
            const result = await personService.getBySearchId(searchId as string);
            return res.json(result || []);
        }

        // Handle Name and/or Birthdate search
        if (pname || pbirth) {
            const result = await personService.search(pname as string, pbirth as string);
            return res.json(result || []);
        }

        // Should be caught by validation middleware but as a fallback
        return res.status(400).json({ error: 'Either pname, pcode, or searchId is required' });
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/persons/{pcode}:
 *   get:
 *     summary: Get person by PCODE
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person found
 *       404:
 *         description: Person not found
 */
router.get('/persons/:pcode', validate(getPersonSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcode = parseInt(req.params.pcode as string);
        logHttp(`GET /persons/:pcode - PCODE: ${pcode}`);

        const result = await personService.getByPcode(pcode);
        if (!result || (Array.isArray(result) && result.length === 0)) {
            const error: any = new Error('No person found with that pcode');
            error.statusCode = 404;
            throw error;
        }

        logInfo('Successfully retrieved person by PCODE', { pcode });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/persons:
 *   post:
 *     summary: Create a new person
 *     tags: [Persons]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Person'
 *     responses:
 *       201:
 *         description: Person created
 */
router.post('/persons', validate(createPersonSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const personData = req.body;
        logHttp('POST /persons', { personData: { ...personData, PNAME: personData.PNAME ? '***' : null } });

        delete personData.PCODE;
        delete personData.FCODE;

        // Logic remains same, service handles ID generation
        const result = await personService.createPerson(personData);
        logInfo('Successfully created new person', { pcode: result.PCODE, fcode: result.FCODE });
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/persons/{pcode}:
 *   put:
 *     summary: Update a person
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Person'
 *     responses:
 *       200:
 *         description: Person updated
 */
router.put('/persons/:pcode', validate(updatePersonSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcode = parseInt(req.params.pcode as string);
        const personData = req.body;
        logHttp(`PUT /persons/:pcode - PCODE: ${pcode}`, { personData: { ...personData, PNAME: personData.PNAME ? '***' : null } });

        const result = await personService.updatePerson(pcode, personData);
        logInfo('Successfully updated person', { pcode });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/persons/{pcode}:
 *   delete:
 *     summary: Delete a person
 *     tags: [Persons]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Person deleted
 */
router.delete('/persons/:pcode', validate(getPersonSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const pcode = parseInt(req.params.pcode as string);
        logHttp(`DELETE /persons/:pcode - PCODE: ${pcode}`);

        const result = await personService.deletePerson(pcode);
        logInfo('Successfully deleted person', { pcode });
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;