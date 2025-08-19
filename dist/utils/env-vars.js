import 'dotenv/config';
export const getEnvVarNum = (key) => {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    let parsed = parseInt(value);
    if (isNaN(parsed)) {
        throw new Error(`Environment variable ${key} is not a valid number: ${value}`);
    }
    return parsed;
};
export const getEnvVarString = (key) => {
    const value = process.env[key];
    if (value === undefined) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
};
