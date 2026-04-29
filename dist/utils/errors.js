export class LMError extends Error {
    constructor(message, type = 'unknown') {
        super(message);
        this.name = 'LMError';
        this.type = type;
    }
    displayError(logger) {
        if (this.type === 'auth') {
            const authMessage = 'Auth error: ' + this.message;
            if (logger) {
                logger.error(authMessage);
            }
            else {
                console.log(authMessage);
            }
        }
        else {
            if (logger) {
                logger.error(`${this.type} error: ${this.message}`);
            }
            else {
                console.log(`${this.type} error: ${this.message}`);
            }
        }
    }
}
