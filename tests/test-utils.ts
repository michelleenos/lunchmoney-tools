import { vi } from 'vitest'

export const makeResponse = (json: any, status = 200, statusText?: string) => {
    return {
        ok: status === 200,
        status,
        statusText,
        json: () => Promise.resolve(json),
    } as Response
}

export const mockFetch = (json: any, status = 200, statusText?: string) => {
    vi.mocked(fetch).mockResolvedValueOnce(makeResponse(json, status, statusText))
}

/**
 * Strips ANSI color codes from a string for cleaner snapshot testing
 * Matches ANSI escape sequences like \x1b[31m (red), \x1b[0m (reset), etc.
 */
export function stripAnsiCodes(str: string): string {
    // This regex matches ANSI escape sequences
    return str.replace(/\x1b\[[0-9;]*m/g, '')
}

/**
 * Strips ANSI codes from an array of strings and joins them
 */
export function stripAndJoin(lines: string[], separator = '\n'): string {
    return lines.map(stripAnsiCodes).join(separator)
}
