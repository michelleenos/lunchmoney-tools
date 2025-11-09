import { describe, expect, it } from 'vitest'
import { LunchMoneyApi } from '../../../src/api.ts'

describe('constructor', () => {
    it('should initialize with provided API key', async () => {
        let api = new LunchMoneyApi('test-api-key')
        expect(api.apiKey).toBe('test-api-key')
    })

    it('should read API key from environment', async () => {
        process.env.LM_API_KEY = 'env-api-key'
        let api = new LunchMoneyApi()
        expect(api.apiKey).toBe('env-api-key')
    })

    it('should throw error when no API key available', async () => {
        // Clear environment variable first
        delete process.env.LM_API_KEY

        // Test that constructor throws when called without arguments
        expect(() => new LunchMoneyApi()).toThrow(
            `Missing Lunch Money API key. Please set the LM_API_KEY environment variable or pass the key to the LunchMoneyApi constructor.`
        )
    })
})
