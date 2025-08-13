/**
 * @param text
 * @param {number} [len=40] - Max length of the returned string. Set to 0 for no limit. (default is 40)
 * @returns A formatted string, possibly shortened to the specified length, or empty if `text` input is undefined.
 */
export declare const display: (text?: string, len?: number) => string;
export declare const money: (amt: string | number) => string;
