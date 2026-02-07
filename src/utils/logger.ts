import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define log colors
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
};

// Add colors to winston
winston.addColors(colors);

// Create the logger
const logger = winston.createLogger({
    levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'firebird-restapi' },
    transports: [
        // Console transport for all logs
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.meta ? JSON.stringify(info.meta) : ''}`
                )
            ),
        }),
        // File transport for errors
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'), // Adjusted path for src/utils
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'), // Adjusted path for src/utils
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});

// Create a stream object for Morgan
// extending logger with stream property manually or just assigning it
(logger as any).stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

// Helper methods for different log levels
export const logError = (message: string, meta: object = {}) => {
    logger.error(message, { meta });
};

export const logWarn = (message: string, meta: object = {}) => {
    logger.warn(message, { meta });
};

export const logInfo = (message: string, meta: object = {}) => {
    logger.info(message, { meta });
};

export const logHttp = (message: string, meta: object = {}) => {
    logger.http(message, { meta });
};

export const logDebug = (message: string, meta: object = {}) => {
    logger.debug(message, { meta });
};

export default logger;