import { ConsolaInstance, createConsola } from 'consola'

let loggerData: { logger: ConsolaInstance }

export const getLogger = () => {
    if (!loggerData) {
        const logger = createConsola()

        loggerData = { logger }
    }
    return loggerData.logger
}
