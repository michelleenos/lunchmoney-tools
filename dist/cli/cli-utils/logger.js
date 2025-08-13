import { createLogger, format, transports } from 'winston';
let logThings;
export const getLogger = () => {
    if (!logThings) {
        const consoleTransport = new transports.Console();
        const logger = createLogger({
            level: 'info',
            transports: [consoleTransport],
            format: format.combine(
            // format.timestamp(),
            format.colorize({
            // all: true,
            }), format.simple()),
        });
        if (process.env.LOG_LEVEL === 'verbose')
            logger.level = 'verbose';
        logThings = { logger, consoleTransport };
    }
    return logThings.logger;
};
