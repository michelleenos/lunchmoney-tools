export class LMError extends Error {
    constructor(message, type = 'unknown') {
        super(message);
        this.name = 'LMError';
        this.type = type;
    }
    displayError() {
        if (this.type === 'auth') {
            const authMessage = 'Auth error: ' + this.message;
            console.log(authMessage);
        }
        else {
            console.log(`${this.type} error: ${this.message}`);
        }
        process.exit(1);
    }
}
