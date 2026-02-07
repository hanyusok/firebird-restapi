import express, { Request, Response, NextFunction } from 'express';
import mtsmtrService from '../services/mtsmtrService';

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

export default router;
