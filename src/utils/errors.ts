import { styleText } from 'node:util'

type ErrorType = 'auth' | 'config' | 'api' | 'unknown'
export class LMError extends Error {
    type: ErrorType
    constructor(message: string, type: ErrorType = 'unknown') {
        super(message)
        this.name = 'LMError'
        this.type = type
    }

    displayError() {
        if (this.type === 'auth') {
            const authMessage =
                styleText(['bgMagenta', 'bold'], 'Auth Error!') +
                styleText(['white'], ` ${this.message}`)
            console.log(authMessage)
        } else {
            const message = styleText(['red', 'inverse'], `${this.type} error: ${this.message}`)
            console.log(message)
        }
        process.exit(1)
    }
}
