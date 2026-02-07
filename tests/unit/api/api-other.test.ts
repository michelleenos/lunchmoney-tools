import { describe, expect, vi, test, beforeEach, Mock } from 'vitest'
import { mockFetch } from '../../test-utils.ts'
import { LM_URL, LunchMoneyApi } from '../../../src/api.ts'

global.fetch = vi.fn()

describe('LunchMoneyApi fetch other things', () => {
    let api: LunchMoneyApi

    beforeEach(() => {
        api = new LunchMoneyApi('test-api-key')
        vi.clearAllMocks()
    })

    test('assets', async () => {
        mockFetch({})

        await api.getAssets()
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/assets`,
            expect.objectContaining({
                method: 'GET',
            })
        )
    })

    test('plaid accounts', async () => {
        mockFetch({})
        await api.getPlaidAccounts()
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/plaid_accounts`,
            expect.objectContaining({
                method: 'GET',
            })
        )
    })

    test('get categories', async () => {
        mockFetch({})
        await api.getCategories()
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            expect.stringContaining(`${LM_URL}/categories`),
            expect.objectContaining({
                method: 'GET',
            })
        )
    })

    test('get tags', async () => {
        mockFetch({})
        await api.getTags()
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            expect.stringContaining(`${LM_URL}/tags`),
            expect.objectContaining({
                method: 'GET',
            })
        )
    })

    test('get current user', async () => {
        mockFetch({})
        await api.getCurrentUser()
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/me`,
            expect.objectContaining({
                method: 'GET',
            })
        )
    })
})
