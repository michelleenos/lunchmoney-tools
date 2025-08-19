import { ConsolaInstance, createConsola } from 'consola'

let logThings: { logger: ConsolaInstance }

export const getLogger = () => {
    if (!logThings) {
        const logger = createConsola()

        logThings = { logger }
    }

    return logThings.logger
}
