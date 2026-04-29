import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { LunchMoneyApi } from '../../src/api'
import { createProgram } from '../../src/cli/program'
import { stripAndJoin } from '../test-utils'
import { LMTransaction } from '../../src/types'

// NOTES
// We are not using child_process.execSync or similar here because it spawns a separate process, which means we cannot mock API calls etc.
// Possible alternatives in future:
// - use a library like execa with the `stdio: 'inherit'` option, which would allow us to capture output while still running in the same process.
// - use msw to mock http requests instead of mocking the API methods (more end-to-end, also more complex)

// - console-table-printer prints to console.log, output does not appear if we mock stdout.write

describe('CLI get-transactions', () => {
    let consoleLogSpy: Mock
    let consoleOutput: string[] = []

    beforeEach(() => {
        process.env.LM_API_KEY = 'test-api-key'

        consoleOutput = []

        consoleLogSpy = vi.spyOn(console, 'log').mockImplementation((...args) => {
            consoleOutput.push(args.join(' '))
        })
    })

    it('should get transactions', async () => {
        const program = createProgram()
        const spy = vi.spyOn(LunchMoneyApi.prototype, 'getTransactions').mockResolvedValue({
            transactions: [],
        })

        await program.parseAsync(['node', 'test', 'get-transactions'])
        expect(spy).toHaveBeenCalled()
    })

    it('should get transactions and display them', async () => {
        const mockTransactions: Partial<LMTransaction>[] = [
            {
                id: 12345,
                date: '2024-01-15',
                payee: 'Test Store',
                amount: '25.50',
                category_name: 'Groceries',
                tags: [],
                asset_display_name: 'Bank Account',
                display_notes: 'A test transaction',
            },
        ]

        vi.spyOn(LunchMoneyApi.prototype, 'getTransactions').mockResolvedValue({
            transactions: mockTransactions as any,
        })

        const program = createProgram()
        await program.parseAsync(['node', 'test', 'get-transactions'])

        const cleanedOutput = stripAndJoin(consoleOutput)
        expect(cleanedOutput).toMatchInlineSnapshot(`
          "┌───────┬────────────┬──────────────────────────────────────────┬────────┬───────────┬──────────────┬────────────────────┐
          │    id │       date │ payee                                    │ amount │ category  │ account      │ notes              │
          ├───────┼────────────┼──────────────────────────────────────────┼────────┼───────────┼──────────────┼────────────────────┤
          │ 12345 │ 2024-01-15 │ Test Store                               │  25.50 │ Groceries │ Bank Account │ A test transaction │
          └───────┴────────────┴──────────────────────────────────────────┴────────┴───────────┴──────────────┴────────────────────┘"
        `)
    })

    it('should search transactions', async () => {
        const mockTransactions: Partial<LMTransaction>[] = [
            {
                id: 12345,
                date: '2024-01-15',
                payee: 'Grocery store - bananas',
                amount: '25.50',
                category_name: 'Groceries',
                tags: [],
                asset_display_name: 'Bank Account',
                display_notes: 'breakfast foods',
            },
            {
                id: 56789,
                date: '2024-01-15',
                payee: 'Grocery store - soup',
                amount: '25.50',
                category_name: 'Groceries',
                tags: [],
                asset_display_name: 'Bank Account',
                display_notes: 'dinner',
            },
        ]

        vi.spyOn(LunchMoneyApi.prototype, 'getTransactions').mockResolvedValue({
            transactions: mockTransactions as any,
        })

        const program = createProgram()
        await program.parseAsync(['node', 'test', 'get-transactions', '--search', 'banana'])

        const cleanedOutput = stripAndJoin(consoleOutput)

        expect(cleanedOutput).toMatchInlineSnapshot(`
          "┌───────┬────────────┬──────────────────────────────────────────┬────────┬───────────┬──────────────┬─────────────────┐
          │    id │       date │ payee                                    │ amount │ category  │ account      │ notes           │
          ├───────┼────────────┼──────────────────────────────────────────┼────────┼───────────┼──────────────┼─────────────────┤
          │ 12345 │ 2024-01-15 │ Grocery store - bananas                  │  25.50 │ Groceries │ Bank Account │ breakfast foods │
          └───────┴────────────┴──────────────────────────────────────────┴────────┴───────────┴──────────────┴─────────────────┘"
        `)
    })
})
