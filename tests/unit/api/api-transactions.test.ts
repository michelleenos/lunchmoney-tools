import { describe, expect, vi, test, beforeEach, Mock } from 'vitest'
import { mockFetch } from '../../test-utils.ts'
import { LM_URL, LunchMoneyApi } from '../../../src/api'
import { LMTransaction } from '../../../src/types/transactions/base'

global.fetch = vi.fn()

const transactions = [
    {
        id: 12345,
        date: '2025-01-15',
        payee: 'Test Coffee Shop',
        amount: '4.50',
        tags: [
            { id: 1, name: 'test-tag' },
            { id: 2, name: 'cafe' },
        ],
        notes: 'Morning coffee',
    },
    {
        id: 23456,
        date: '2025-04-07',
        amount: '17.0000',
        payee: 'Water Bill',
    },
    {
        id: 45678,
        date: '2025-04-07',
        amount: '39.2900',
        payee: 'Electricity',
        notes: 'Electricity Bill',
    },
    {
        id: 456,
        date: '2025-06-07',
        payee: 'Groceries',
        amount: '25.0000',
        tags: [{ id: 1, name: 'test-tag' }],
        notes: 'bread, cereal, and blueberries',
    },
]

describe('LunchMoneyApi transactions', () => {
    let api: LunchMoneyApi
    beforeEach(() => {
        vi.clearAllMocks()
        api = new LunchMoneyApi('test-api-key')
    })

    describe('Fetch transactions', () => {
        beforeEach(() => {
            mockFetch({ transactions, has_more: false })
        })

        test('should return fetched transactions', async () => {
            const result = await api.getTransactions()
            expect(result.transactions).toHaveLength(4)
            expect(result.transactions[0].payee).toBe('Test Coffee Shop')
        })

        test('fetch transactions with provided start date and add an end date', async () => {
            await api.getTransactions({ start_date: '2025-08-09' })
            expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
                expect.stringContaining('end_date') && expect.stringContaining('start_date'),
                expect.anything()
            )
        })

        test('fetch transactions with tag id', async () => {
            await api.getTransactions({ tag_id: 123 })
            expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
                expect.stringContaining('tag_id=123'),
                expect.anything()
            )
        })
    })

    test('Search transactions', async () => {
        let trs = transactions as unknown as LMTransaction[]
        // let transactions = transactions as LMTransaction[]
        const notesSearch = api.searchTransactions(trs, 'blueberries')

        expect(notesSearch.length).toBe(1)
        expect(notesSearch[0].payee).toBe('Groceries')

        const nameSearch = api.searchTransactions(trs, 'groceries')
        expect(nameSearch.length).toBe(1)
        expect(nameSearch[0].payee).toBe('Groceries')

        // "Water Bill" and "Electricity Bill"
        const billSearch = api.searchTransactions(trs, 'bill')
        expect(billSearch.length).toBe(2)
    })

    test('Fetch one transaction with id', async () => {
        const testId = 987
        mockFetch({ name: 'Test', id: testId })

        await api.getTransaction(testId)
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/transactions/${testId}`,
            expect.objectContaining({ method: 'GET' })
        )
    })

    describe('Update transactions', () => {
        let api: LunchMoneyApi

        beforeEach(() => {
            api = new LunchMoneyApi('test-api-key')
            vi.clearAllMocks()
        })

        describe('update transaction tags', () => {
            const transaction = transactions[0]
            let getFn: Mock
            let reqFn: Mock
            beforeEach(() => {
                getFn = vi
                    .spyOn(api, 'getTransaction')
                    .mockReturnValue(Promise.resolve(transaction as LMTransaction))

                reqFn = vi.spyOn(api, 'request').mockReturnValue(Promise.resolve({ updated: true }))
            })

            test('add tag', async () => {
                await api.updateTransaction(transaction.id, { addTags: ['test-tag-1'] })

                expect(getFn).toHaveBeenLastCalledWith(transaction.id)
                expect(reqFn).toHaveBeenLastCalledWith('PUT', `transactions/${transaction.id}`, {
                    transaction: expect.objectContaining({
                        tags: expect.arrayContaining(['test-tag-1', 'test-tag']),
                    }),
                })
            })

            test('remove tag', async () => {
                await api.updateTransaction(transaction.id, { removeTags: ['cafe'] })

                expect(getFn).toHaveBeenLastCalledWith(transaction.id)
                expect(reqFn).toHaveBeenLastCalledWith('PUT', `transactions/${transaction.id}`, {
                    transaction: expect.objectContaining({
                        tags:
                            expect.not.arrayContaining(['cafe']) &&
                            expect.arrayContaining(['test-tag']),
                    }),
                })
            })

            test('remove tag with id', async () => {
                await api.updateTransaction(transaction.id, { removeTags: [2] })

                expect(getFn).toHaveBeenLastCalledWith(transaction.id)
                expect(reqFn).toHaveBeenLastCalledWith('PUT', `transactions/${transaction.id}`, {
                    transaction: expect.objectContaining({
                        tags:
                            expect.not.arrayContaining(['cafe']) &&
                            expect.arrayContaining(['test-tag']),
                    }),
                })
            })

            test('add and remove tags', async () => {
                await api.updateTransaction(transaction.id, {
                    removeTags: [2],
                    addTags: ['new-tag'],
                })

                expect(getFn).toHaveBeenLastCalledWith(transaction.id)
                expect(reqFn).toHaveBeenLastCalledWith('PUT', `transactions/${transaction.id}`, {
                    transaction: expect.objectContaining({
                        tags:
                            expect.not.arrayContaining(['cafe']) &&
                            expect.arrayContaining(['new-tag', 'test-tag']),
                    }),
                })
            })
        })

        describe('update transaction notes', async () => {
            const transaction = transactions[0]

            beforeEach(() => {
                vi.clearAllMocks()
                vi.spyOn(api, 'getTransaction').mockReturnValue(
                    Promise.resolve(transaction as LMTransaction)
                )
                vi.spyOn(api, 'request').mockReturnValue(Promise.resolve({ updated: true }))
            })

            test('prepend notes', async () => {
                await api.updateTransaction(transaction.id, { prependNotes: 'yum coffee' })
                expect(api.getTransaction).toHaveBeenLastCalledWith(transaction.id)
                expect(api.request).toHaveBeenLastCalledWith(
                    'PUT',
                    `transactions/${transaction.id}`,
                    {
                        transaction: expect.objectContaining({
                            notes: `yum coffee ${transaction.notes}`,
                        }),
                    }
                )
            })

            test('append notes', async () => {
                await api.updateTransaction(transaction.id, { appendNotes: 'yum coffee' })
                expect(api.getTransaction).toHaveBeenLastCalledWith(transaction.id)
                expect(api.request).toHaveBeenLastCalledWith(
                    'PUT',
                    `transactions/${transaction.id}`,
                    {
                        transaction: expect.objectContaining({
                            notes: `${transaction.notes} yum coffee`,
                        }),
                    }
                )
            })

            test('append and prepend notes', async () => {
                await api.updateTransaction(transaction.id, {
                    appendNotes: 'coffee',
                    prependNotes: 'yum',
                })
                expect(api.getTransaction).toHaveBeenLastCalledWith(transaction.id)
                expect(api.request).toHaveBeenLastCalledWith(
                    'PUT',
                    `transactions/${transaction.id}`,
                    {
                        transaction: expect.objectContaining({
                            notes: `yum ${transaction.notes} coffee`,
                        }),
                    }
                )
            })
        })
    })

    test('create transactions', async () => {
        mockFetch({ ids: [1] })

        const newTransaction = { date: '2025-01-01', amount: 20, payee: 'test' }
        await api.createTransactions([newTransaction])
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/transactions`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ transactions: [newTransaction] }),
            })
        )
    })

    test('unsplit transactions', async () => {
        mockFetch([])

        await api.unsplitTransactions([2])
        expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
            `${LM_URL}/transactions/unsplit`,
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ parent_ids: [2], remove_parents: false }),
            })
        )
    })

    describe('transaction groups', () => {
        const groupId = 5
        test('get transaction group', async () => {
            mockFetch({ payee: 'test' })

            const returned = await api.getTransactionGroup(groupId)
            expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
                `${LM_URL}/transactions/group/${groupId}`,
                expect.objectContaining({
                    method: 'GET',
                    headers: { Authorization: 'Bearer test-api-key' },
                })
            )

            expect(returned.payee).toBe('test')
        })

        test('delete transaction group', async () => {
            mockFetch([])
            await api.deleteTransactionGroup(groupId)

            expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
                `${LM_URL}/transactions/group/${groupId}`,
                expect.objectContaining({ method: 'DELETE' })
            )
        })

        test('create transaction group', async () => {
            mockFetch({})
            let newGroupData = { date: '2025-01-01', payee: 'test', transactions: [1] }

            await api.createTransactionGroup(newGroupData)
            expect(vi.mocked(fetch)).toHaveBeenLastCalledWith(
                `${LM_URL}/transactions/group`,
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(newGroupData),
                })
            )
        })
    })
})
