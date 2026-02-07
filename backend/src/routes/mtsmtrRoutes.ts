import express, { Request, Response, NextFunction } from 'express';
import mtsmtrService from '../services/mtsmtrService';
import validate from '../middleware/validate';
import { createMtrSchema, updateMtrSchema } from '../schemas/mtsmtrSchema';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MTSMTR
 *   description: Treatment/Medical Record management
 */

/**
 * @swagger
 * /api/mtsmtr/date/{visidate}:
 *   get:
 *     summary: Get treatment list by date
 *     tags: [MTSMTR]
 *     parameters:
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^\d{8}$'
 *         description: Date in YYYYMMDD format
 *     responses:
 *       200:
 *         description: List of treatment records
 */
router.get('/date/:visidate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { visidate } = req.params;
        // Format YYYYMMDD -> YYYY-MM-DD for Firebird query
        const formattedDate = `${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}`;

        const data = await mtsmtrService.getByVisitDate(formattedDate);

        // Return empty list instead of 404 if no records found, 
        // consistent with typical list APIs (though mtswait returned 404, valid choice too)
        // User implementation for mtswait returned 404, let's stick to that pattern or just array.
        // Person list returns array.

        res.json(data || []);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/mtsmtr:
 *   post:
 *     summary: Create a new MTR record
 *     tags: [MTSMTR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - PCODE
 *               - VISIDATE
 *               - PNAME
 *             properties:
 *               PCODE:
 *                 type: integer
 *               VISIDATE:
 *                 type: string
 *                 format: date
 *               PNAME:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createMtrSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await mtsmtrService.create(req.body);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/mtsmtr/{id}/{visidate}:
 *   put:
 *     summary: Update an MTR record
 *     tags: [MTSMTR]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: MTR record ID (# column)
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id/:visidate', validate(updateMtrSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, visidate } = req.params;
        const result = await mtsmtrService.update(Number(id), visidate as string, req.body);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/**
 * @swagger
 * /api/mtsmtr/{id}/{visidate}:
 *   delete:
 *     summary: Delete an MTR record
 *     tags: [MTSMTR]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: MTR record ID (# column)
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:id/:visidate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id, visidate } = req.params;
        const result = await mtsmtrService.delete(Number(id), visidate as string);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;
