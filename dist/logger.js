import { createConsola } from 'consola';
let loggerData;
export const getLogger = () => {
    if (!loggerData) {
        const logger = createConsola();
        loggerData = { logger };
    }
    return loggerData.logger;
};
