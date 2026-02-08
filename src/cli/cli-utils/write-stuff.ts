import { decode } from 'html-entities'
/**
 * @param text
 * @param {number} [len=40] - Max length of the returned string. Set to 0 for no limit. (default is 40)
 * @returns A formatted string, possibly shortened to the specified length, or empty if `text` input is undefined.
 */
export const display = (text?: string, len: number = 40) => {
    if (!text) return ''
    text = text.trim()
    text = decode(text)
    if (len > 0 && text.length > len) {
        return text.slice(0, len - 3) + '...'
    }
    return text
}

export const money = (amt: string | number) => {
    let num = Number(amt)
    if (isNaN(num)) num = 0
    let fixed = num.toFixed(2)
    let parts = fixed.split('.')
    if (parts[0].length > 3) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
    if (parts[1].length < 2) {
        parts[1] = parts[1].padEnd(2, '0')
    }
    return parts.join('.')
}
