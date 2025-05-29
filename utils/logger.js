const winston = require('winston');
const path = require('path');

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
            filename: path.join(__dirname, '../logs/error.log'),
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: path.join(__dirname, '../logs/combined.log'),
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
        }),
    ],
});

// Create a stream object for Morgan
logger.stream = {
    write: (message) => {
        logger.http(message.trim());
    },
};

// Helper methods for different log levels
const logError = (message, meta = {}) => {
    logger.error(message, { meta });
};

const logWarn = (message, meta = {}) => {
    logger.warn(message, { meta });
};

const logInfo = (message, meta = {}) => {
    logger.info(message, { meta });
};

const logHttp = (message, meta = {}) => {
    logger.http(message, { meta });
};

const logDebug = (message, meta = {}) => {
    logger.debug(message, { meta });
};

module.exports = {
    logger,
    logError,
    logWarn,
    logInfo,
    logHttp,
    logDebug,
}; 