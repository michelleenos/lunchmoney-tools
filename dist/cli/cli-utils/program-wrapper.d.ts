export declare const programWrapper: <T extends any[]>(asyncFn: (...args: T) => Promise<void>) => (...args: T) => Promise<void>;
