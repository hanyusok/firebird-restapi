import { Request, Response, NextFunction } from 'express';
import { logError } from '../utils/logger';

// Standardized error handler
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    // Log the error
    logError('Unhandled Error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
    });

    // Default status code and message
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    // Send response
    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;
