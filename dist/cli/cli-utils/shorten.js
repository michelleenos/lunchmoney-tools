export const shorten = (text, len = 40) => {
    if (!text)
        return '';
    if (text.length > len) {
        return text.slice(0, len - 3) + '...';
    }
    return text;
};
