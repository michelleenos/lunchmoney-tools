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
            const authMessage = 'Auth error: ' + this.message
            console.log(authMessage)
        } else {
            console.log(`${this.type} error: ${this.message}`)
        }
        process.exit(1)
    }
}
