import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from './config/swagger';
import routes from './routes'; // This imports from index.ts
import errorHandler from './middleware/errorHandler';

const app = express();

import path from 'path';

// Security Middleware
app.use(helmet());

// Serve static files (including favicon.ico)
app.use(express.static(path.join(__dirname, '../public')));

// CORS (keep existing)
app.use(cors());

// Body Parser
app.use(express.json());

// Logging (keep existing)
app.use((req: Request, res: Response, next: NextFunction) => {
    // console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Add a test route
app.get('/test', (req: Request, res: Response) => {
    console.log('Test route accessed');
    res.json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Firebird REST API',
        documentation: '/api-docs',
        status: 'running'
    });
});

// Use all routes
app.use(routes);

// 404 Handler for undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
    const error: any = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});

// Centralized Error Handling
app.use(errorHandler);

// Handle process events
process.on('uncaughtException', (err: Error) => {
    console.error('Uncaught Exception:', err);
    // Ideally, we should exit here, but keeping existing behavior or logging
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Local URL: http://localhost:${PORT}`);
    // console.log(`Network URL: http://0.0.0.0:${PORT}`);
    console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    server.close(() => {
        console.log('Server closed. Process terminating...');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Performing graceful shutdown...');
    server.close(() => {
        console.log('Server closed. Process terminating...');
        process.exit(0);
    });
});
// Trigger restart (Person Service Return Fixed)
