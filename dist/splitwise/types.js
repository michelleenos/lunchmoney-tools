export const isSplitwiseErrorString = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    if (!('error' in data))
        return false;
    return typeof data.error === 'string';
};
export const isSplitwiseErrorObject = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    if (!('errors' in data))
        return false;
    if (!('base' in data.errors))
        return false;
    if (!Array.isArray(data.errors.base))
        return false;
    return true;
};
