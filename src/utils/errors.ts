import { ConsolaInstance } from 'consola'

type ErrorType = 'auth' | 'config' | 'api' | 'unknown'
export class LMError extends Error {
    type: ErrorType
    constructor(message: string, type: ErrorType = 'unknown') {
        super(message)
        this.name = 'LMError'
        this.type = type
    }

    displayError(logger?: ConsolaInstance) {
        if (this.type === 'auth') {
            const authMessage = 'Auth error: ' + this.message
            if (logger) {
                logger.error(authMessage)
            } else {
                console.log(authMessage)
            }
        } else {
            if (logger) {
                logger.error(`${this.type} error: ${this.message}`)
            } else {
                console.log(`${this.type} error: ${this.message}`)
            }
        }
    }
}
