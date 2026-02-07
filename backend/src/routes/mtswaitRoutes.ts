import express, { Request, Response, NextFunction } from 'express';
import mtswaitService from '../services/mtswaitService';
import { convertToLocalTime } from '../utils/koreanUtils';
import validate from '../middleware/validate';
import {
  createWaitSchema,
  updateWaitSchema, // kept imports
  deleteWaitSchema, // kept imports
  getWaitSchema
} from '../schemas/mtswaitSchema';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: MTSWAIT
 *   description: Waiting list management
 */

/**
 * @swagger
 * /api/mtswait/date/{visidate}:
 *   get:
 *     summary: Get waiting list by date
 *     tags: [MTSWAIT]
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
 *         description: List of waiting patients
 */
router.get('/date/:visidate', /* validate(getWaitSchema), */ async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { visidate } = req.params;
    // Manual date format handling due to legacy YYYYMMDD support vs Schema YYYY-MM-DD
    const formattedDate = `${visidate.slice(0, 4)}-${visidate.slice(4, 6)}-${visidate.slice(6, 8)}`;
    const data = await mtswaitService.getByVisitDate(formattedDate!);
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return res.status(404).json({ error: 'No records found for this date' });
    }
    res.json(data);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/mtswait:
 *   post:
 *     summary: Add to waiting list
 *     tags: [MTSWAIT]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               PCODE:
 *                 type: integer
 *               VISIDATE:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', validate(createWaitSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    await mtswaitService.create(req.body);
    res.status(201).json({ message: 'Created' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/mtswait/{pcode}/{visidate}:
 *   put:
 *     summary: Update waiting record
 *     tags: [MTSWAIT]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:pcode/:visidate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pcode, visidate } = req.params;
    await mtswaitService.update(pcode as string, visidate as string, req.body);
    res.json({ message: 'Updated' });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/mtswait/{pcode}/{visidate}:
 *   delete:
 *     summary: Remove from waiting list
 *     tags: [MTSWAIT]
 *     parameters:
 *       - in: path
 *         name: pcode
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: visidate
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 */
router.delete('/:pcode/:visidate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { pcode, visidate } = req.params;
    await mtswaitService.delete(pcode as string, visidate as string);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
});

export default router;