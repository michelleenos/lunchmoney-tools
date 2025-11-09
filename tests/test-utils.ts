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
