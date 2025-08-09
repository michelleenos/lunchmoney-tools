import { LMError } from "../../utils/errors.js";
export const programWrapper = (asyncFn) => {
    return async (...args) => {
        try {
            await asyncFn(...args);
        }
        catch (e) {
            if (e instanceof LMError) {
                e.displayError();
            }
            else {
                console.error('An unexpected error occurred:', e);
            }
        }
    };
};
