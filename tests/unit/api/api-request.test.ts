import { beforeEach, describe, expect, test, vi } from 'vitest'
import { LunchMoneyApi } from '../../../src/api.ts'
import { mockFetch } from '../../test-utils.ts'

global.fetch = vi.fn()

describe('LunchMoneyApi request method', () => {
    let api: LunchMoneyApi

    beforeEach(() => {
        api = new LunchMoneyApi('test-api-key')
        vi.clearAllMocks()
    })

    test('should make successful GET request', async () => {
        const mockResponse = { data: 'test' }
        mockFetch(mockResponse)
        const result = await api.request('GET', 'test-endpoint')

        expect(fetch).toHaveBeenCalledWith(
            'https://dev.lunchmoney.app/v1/test-endpoint',
            expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-api-key',
                }),
            })
        )
        expect(result).toEqual(mockResponse)
    })

    test('should make successful POST request with args', async () => {
        const mockResponse = { success: true }
        const requestArgs = { name: 'test', amount: 100 }
        mockFetch({ success: true })
        const result = await api.request('POST', 'create-endpoint', requestArgs)

        expect(fetch).toHaveBeenCalledWith(
            'https://dev.lunchmoney.app/v1/create-endpoint',
            expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    Authorization: 'Bearer test-api-key',
                    'Content-Type': 'application/json',
                }),
                body: JSON.stringify(requestArgs),
            })
        )
        expect(result).toEqual(mockResponse)
    })

    test('should handle 401 unauthorized error', async () => {
        mockFetch({ name: 'Error', message: 'Access token does not exist.' }, 401, 'Unauthorized')

        await expect(api.request('GET', 'protected-endpoint')).rejects.toThrow('Invalid API key')
    })

    test('should handle other HTTP errors', async () => {
        const errorResponse = { error: 'Bad request' }

        mockFetch(errorResponse, 400, 'Bad request')

        await expect(api.request('POST', 'bad-endpoint')).rejects.toThrow(
            `Error fetching Lunch Money API: 400 Bad request \n ${JSON.stringify(
                errorResponse,
                null,
                2
            )}`
        )
    })

    test('should handle API error response with string', async () => {
        const errorResponse = { error: 'Something went wrong' }
        mockFetch(errorResponse, 200)

        await expect(api.request('GET', 'error-endpoint')).rejects.toThrow(
            'Lunch Money API error: Something went wrong'
        )
    })

    test('should handle numeric response types', async () => {
        const numericResponse = 42
        mockFetch(numericResponse)

        const result = await api.request<number>('GET', 'numeric-endpoint')

        expect(result).toBe(42)
    })
})
