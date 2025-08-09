type ErrorType = 'auth' | 'config' | 'api' | 'unknown';
export declare class LMError extends Error {
    type: ErrorType;
    constructor(message: string, type?: ErrorType);
    displayError(): void;
}
export {};
