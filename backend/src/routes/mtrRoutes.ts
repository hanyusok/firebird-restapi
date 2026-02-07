import express, { Request, Response, NextFunction } from 'express';
import MtrService from '../services/mtrService';
import { logError, logInfo } from '../utils/logger'; // kept for potential use
import { convertToLocalTime } from '../utils/koreanUtils';
import validate from '../middleware/validate';
import {
    createMtrSchema,
    updateMtrSchema,
    getMtrByPcodeSchema,
    getMtrByVisidateSchema
} from '../schemas/mtrSchema';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MTR
 *   description: Medical Treatment Records
 */

/**
 * @swagger
 * /api/mtr:
 *   get:
 *     summary: Get all medical treatment records
 *     tags: [MTR]
 *     responses:
 *       200:
 *         description: List of records
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const records = await MtrService.getAll();
        res.json(records);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/mtr/date/{visidate}:
 *   get:
 *     summary: Get records by date
 *     tags: [MTR]
 *     parameters:
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *         description: Date string (YYYYMMDD)
 *     responses:
 *       200:
 *         description: List of records
 */
router.get('/date/:visidate', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { visidate } = req.params;
        const formattedDate = convertToLocalTime(`${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}`);
        const records = await MtrService.getByVisidate(formattedDate!); // convertToLocalTime might return null, but here assuming valid input or it returns null which is handled
        res.json(records || []);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/mtr/{pcode}:
 *   get:
 *     summary: Get record by PCODE
 *     tags: [MTR]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Record found
 *       404:
 *         description: Record not found
 */
router.get('/:pcode', validate(getMtrByPcodeSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const record = await MtrService.getByPcode(req.params.pcode as string);
        if (!record) {
            const error: any = new Error('Record not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(record);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/mtr:
 *   post:
 *     summary: Create new record
 *     tags: [MTR]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createMtrSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MtrService.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/mtr/{pcode}:
 *   put:
 *     summary: Update record
 *     tags: [MTR]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:pcode', validate(updateMtrSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MtrService.update(req.params.pcode as string, req.body);
        if (!result) {
            const error: any = new Error('Record not found');
            error.statusCode = 404;
            throw error;
        }
        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /api/mtr/{pcode}:
 *   delete:
 *     summary: Delete record
 *     tags: [MTR]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:pcode', validate(getMtrByPcodeSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await MtrService.delete(req.params.pcode as string);
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;