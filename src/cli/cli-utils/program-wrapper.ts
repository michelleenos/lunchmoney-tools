import { LMError } from '../../utils/errors.ts'
import { getLogger } from './logger.ts'

let logger = getLogger()

export const programWrapper = <T extends any[]>(asyncFn: (...args: T) => Promise<void>) => {
    return async (...args: T) => {
        try {
            await asyncFn(...args)
        } catch (e) {
            if (e instanceof LMError) {
                e.displayError(logger)
            } else {
                if (logger) {
                    logger.error('An unexpected error occured: ', e)
                } else {
                    console.error('An unexpected error occurred:', e)
                }
            }

            process.exit(1)
        }
    }
}
