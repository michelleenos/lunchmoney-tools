import { execSync } from 'child_process'
import { describe, it, expect } from 'vitest'

describe('CLI commands', () => {
    it('should display help', () => {
        const output = execSync('npx tsx src/cli/index.ts --help', { encoding: 'utf8' })
        expect(output).toContain('Usage: lm-tools')
        expect(output).toContain('get-transactions')
    })

    it('should handle missing API key', () => {
        try {
            execSync('npx tsx src/cli/index.ts get-transactions', {
                encoding: 'utf8',
                env: { ...process.env, LM_API_KEY: undefined },
            })
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
            expect((error as any).stdout.trim()).toBe(
                'Auth error: Missing Lunch Money API key. Please set the LM_API_KEY environment variable or pass the key to the LunchMoneyApi constructor.'
            )
        }
    })
})
