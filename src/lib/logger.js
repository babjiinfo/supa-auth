import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// Function to create a new logger for each type
const createLogger = (filename) => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
        ),
        transports: [
            new winston.transports.Console(),
            new winston.transports.DailyRotateFile({
                filename: path.join('logs', filename, 'app-%DATE%.log'), // Separate folder per log type
                datePattern: 'YYYY-MM-DD',
                maxFiles: '14d', // Keep logs for 14 days
                zippedArchive: true, // Compress old logs
            }),
        ],
    });
};

// Separate loggers for different functionalities
const loginLogger = createLogger('login');
const signupLogger = createLogger('signup');

export { loginLogger, signupLogger };
