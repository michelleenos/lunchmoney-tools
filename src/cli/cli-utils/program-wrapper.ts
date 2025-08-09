import { LMError } from '../../utils/errors.ts'

export const programWrapper = <T extends any[]>(asyncFn: (...args: T) => Promise<void>) => {
    return async (...args: T) => {
        try {
            await asyncFn(...args)
        } catch (e) {
            if (e instanceof LMError) {
                e.displayError()
            } else {
                console.error('An unexpected error occurred:', e)
            }
        }
    }
}
