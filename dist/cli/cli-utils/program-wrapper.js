import { LMError } from "../../utils/errors.js";
import { getLogger } from "../../logger.js";
let logger = getLogger();
export const programWrapper = (asyncFn) => {
    return async (...args) => {
        try {
            await asyncFn(...args);
        }
        catch (e) {
            if (e instanceof LMError) {
                e.displayError(logger);
            }
            else {
                if (logger) {
                    logger.error('An unexpected error occured: ', e);
                }
                else {
                    console.error('An unexpected error occurred:', e);
                }
            }
            process.exit(1);
        }
    };
};
