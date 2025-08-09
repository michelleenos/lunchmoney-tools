export const shorten = (text?: string, len: number = 40) => {
    if (!text) return ''
    text = text.trim()
    if (text.length > len) {
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
