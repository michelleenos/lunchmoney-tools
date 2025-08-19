import { createConsola } from 'consola';
let logThings;
export const getLogger = () => {
    if (!logThings) {
        const logger = createConsola();
        logThings = { logger };
    }
    return logThings.logger;
};
