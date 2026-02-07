import { describe, expect, test, vi } from 'vitest'
import { LM_URL } from '../../src/api'
import { doRequest } from '../../src/utils/request'
import { mockFetch } from '../test-utils'

global.fetch = vi.fn()

const testUrl = LM_URL
const testEndpoint = 'test-endpoint'
const testHeaders = { Authorization: 'Bearer test-api-key' }
const testArgs = {
    id: 123,
    name: 'Hello',
    object: {
        foo: 'foo',
        bar: 'bar string',
        num: 24,
    },
    arr: [24, 56],
}

describe('doRequest function', () => {
    test('GET request appends parameters to URL', async () => {
        mockFetch({ data: 'test' })

        const result = await doRequest('GET', testUrl, testHeaders, testEndpoint, {
            search: 'hello',
            number: 24,
        })

        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${testUrl}/${testEndpoint}?search=hello&number=24`,
            {
                method: 'GET',
                headers: testHeaders,
                body: undefined,
            }
        )

        expect(result).toMatchObject({ ok: true, status: 200 })
        const jsonResult = await result.json()
        expect(jsonResult).toEqual({ data: 'test' })
    })

    test('DELETE request appends parameters to URL', async () => {
        mockFetch(0)

        const result = await doRequest('DELETE', testUrl, {}, '', { id: 123 })

        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(`${testUrl}/?id=123`, {
            method: 'DELETE',
            headers: {},
            body: undefined,
        })
        const jsonResult = await result.json()
        expect(jsonResult).toBe(0)
    })

    test('POST request', async () => {
        mockFetch({ data: 'test' })

        await doRequest('POST', testUrl, testHeaders, testEndpoint, testArgs)

        expect(vi.mocked(fetch)).toHaveBeenCalledWith(`${testUrl}/${testEndpoint}`, {
            method: 'POST',
            headers: { ...testHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(testArgs),
        })

        mockFetch({ data: 'test' })
        const response = await doRequest('POST', testUrl, {}, testEndpoint, testArgs)
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(`${testUrl}/${testEndpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testArgs),
        })

        expect(response).toMatchObject({ ok: true, status: 200 })
        const jsonResult = await response.json()
        expect(jsonResult).toEqual({ data: 'test' })
    })

    test('PUT request', async () => {
        mockFetch({ data: 'test' })

        const result = await doRequest('PUT', testUrl, testHeaders, testEndpoint, testArgs)

        expect(vi.mocked(fetch)).toHaveBeenCalledWith(`${testUrl}/${testEndpoint}`, {
            method: 'PUT',
            headers: { ...testHeaders, 'Content-Type': 'application/json' },
            body: JSON.stringify(testArgs),
        })

        expect(result).toMatchObject({ ok: true, status: 200 })
        const jsonResult = await result.json()
        expect(jsonResult).toEqual({ data: 'test' })
    })
})
