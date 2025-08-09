import { createLogger, format, log, Logger, transports } from 'winston'

let logThings: { logger: Logger; consoleTransport: transports.ConsoleTransportInstance }
// let logger: Logger
// let consoleTransport: transports.ConsoleTransportInstance

export const getLogger = () => {
    if (!logThings) {
        const consoleTransport = new transports.Console()

        const logger = createLogger({
            level: 'info',
            transports: [consoleTransport],
            format: format.combine(
                // format.timestamp(),
                format.colorize({
                    // all: true,
                }),
                format.simple()
            ),
        })

        logThings = { logger, consoleTransport }
    }

    return logThings.logger
}
