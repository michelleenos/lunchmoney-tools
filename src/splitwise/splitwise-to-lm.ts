import { printTable, Table } from 'console-table-printer'
import { LunchMoneyApi } from '../api.ts'
import { getLogger } from '../cli/cli-utils/logger.ts'
import { display, money } from '../cli/cli-utils/write-stuff.ts'
import type {
    LMInsertTransactionObject,
    LMInsertTransactionsSettings,
    LMTransaction,
} from '../types/index.ts'
import { LMError } from '../utils/errors.ts'
import { SplitwiseApi } from './splitwise-api.ts'
import type { SplitwiseExpense } from './types.ts'
import { getEnvVarNum } from '../utils/env-vars.ts'

interface SplitwiseToLMOpts {
    startDate?: string
    endDate?: string
    assetId?: number
    tag?: string | string[]
    filterSelf?: boolean
    filterPayment?: boolean
    dryRun?: boolean
    lmApiKey?: string
    swApiKey?: string
    swGroupId?: number
    lmSwAssetId?: number
    /**
     * The script will check for existing transactions in Lunch Money that have an `external_id` matching the Splitwise expense ID.
     * With 'update', if a match is found, the script will check to ensure the amount and date still match data from Splitwise, and update the transaction if not.
     * If `handleDupes` is 'skip', it will simply skip existing transactions and not attempt to create or update them.
     * Note this is different from the `skip_duplicates` option in LMInsertTransactionsSettings, which toggles deduping behavior on the Lunch Money server side.
     * @default 'update'
     */
    handleDupes?: 'update' | 'skip'
    lmInsertSettings?: LMInsertTransactionsSettings
}

const logger = getLogger()

export const splitwiseToLMWithUpdates = async ({
    startDate,
    endDate,
    assetId: assetIdOpt,
    tag = 'splitwise-imported',
    filterSelf = true,
    filterPayment = true,
    dryRun,
    lmApiKey,
    swApiKey,
    swGroupId,
    handleDupes = 'update',
    lmInsertSettings: {
        apply_rules = false,
        check_for_recurring = false,
        skip_duplicates = true,
        skip_balance_update = true,
        debit_as_negative = false,
    } = {},
}: SplitwiseToLMOpts) => {
    const lm = new LunchMoneyApi(lmApiKey)
    const sw = new SplitwiseApi(swApiKey, swGroupId)
    await sw.init()

    let assetId = assetIdOpt
    if (!assetId) {
        try {
            assetId = getEnvVarNum('LM_SW_ASSET_ID')
        } catch (e) {
            throw new LMError(
                'No asset ID provided; either provide it with --asset-id or set LM_SW_ASSET_ID env variable',
                'config'
            )
        }

        logger.info(`Using asset ID ${assetId} from LM_SW_ASSET_ID environment variable`)
    }
    const expenses = await sw.getFilteredExpenses({
        dateAfter: startDate,
        dateBefore: endDate,
        filterDeleted: true,
        filterPayment,
        filterSelf,
    })

    const lmRes = await lm.getTransactions({
        start_date: startDate,
        end_date: endDate,
        asset_id: assetId,
    })

    const transactions = lmRes.transactions

    logger.info(
        `Found ${expenses.length} expenses from Splitwise, and ${lmRes.transactions.length} transactions from LunchMoney.`
    )

    const expensesWithPayment = expenses.reduce((acc, exp) => {
        const userPayment = exp.repayments.find((r) => r.from === sw.userId)?.amount
        if (userPayment) {
            acc.push({
                ...exp,
                userPayment: parseFloat(userPayment).toFixed(2),
            })
        }

        return acc
    }, [] as (SplitwiseExpense & { userPayment: string })[])

    const existed: SplitwiseToLMUpdateData[] = []
    const create: LMInsertTransactionObject[] = []

    for (const expense of expensesWithPayment) {
        const { id, description, date, cost, created_by, details, userPayment } = expense

        let existing = transactions.find(
            (t) => t.external_id === `splitwise-${id}` || t.external_id === id.toString()
        )

        if (existing) {
            if (handleDupes === 'skip') {
                logger.verbose(
                    `Splitwise expense "${display(
                        description,
                        30
                    )}" already exists in LunchMoney, skipping.`
                )
                continue
            }

            let update = getSwToLMUpdateData(expense, existing)
            existed.push(update)
            if (update.matches) {
                logger.verbose(
                    `Splitwise expense "${display(
                        description,
                        30
                    )}" is already matched in LunchMoney. Skipping update.`
                )
                continue
            }

            if (!dryRun) {
                let updateRes = await lm.updateTransaction(
                    existing.id,
                    {
                        date: update.correctDate || update.date,
                        amount: update.correctAmount || update.amount,
                        notes: update.notes,
                    },
                    { skip_balance_update, debit_as_negative }
                )

                if (updateRes.updated) {
                    logger.info(
                        `Updated transaction ${existing.id} to match Splitwise expense ${id}`
                    )
                } else {
                    throw new LMError(
                        `Failed to update transaction ${existing.id} for Splitwise expense ${id}`
                    )
                }
            }
        } else {
            const newTransaction: LMInsertTransactionObject = {
                date: new Date(date).toISOString().split('T')[0],
                payee: description,
                tags: Array.isArray(tag) ? tag : [tag],
                asset_id: assetId,
                amount: userPayment,
                notes: `Splitwise: ${cost} from ${created_by.first_name}. ${details || ''}`,
                external_id: `splitwise-${id}`,
            }

            create.push(newTransaction)

            if (dryRun) {
                continue
            } else {
                let res = await lm.createTransactions([newTransaction], {
                    apply_rules,
                    check_for_recurring,
                    skip_duplicates,
                    skip_balance_update,
                    debit_as_negative,
                })

                if (res.ids.length === 0) {
                    logger.warn(
                        `Failed to add transaction for Splitwise expense ${id}: ${description}, ${userPayment} on ${date}, might be a duplicate we didn't find`
                    )
                } else {
                    logger.info(
                        `Added transaction for Splitwise expense ${id}: ${description}, ${userPayment} on ${date}`
                    )
                }
            }
        }
    }

    if (dryRun) {
        printTable(
            create.map((t) => ({
                date: t.date,
                payee: display(t.payee, 20),
                amount: t.amount,
                notes: display(t.notes, 30),
                external_id: t.external_id,
            })),
            {
                title: `Dry run: ${create.length} transactions to be added in Lunch Money`,
            }
        )

        if (handleDupes === 'update') {
            let tab = new Table({
                title: `Dry run: ${existed.length} expenses already in Lunch Money. Unmatched items (in red) will be updated.`,
                columns: [
                    { name: 'matches', alignment: 'center' },
                    { name: 'lmPayee', alignment: 'left', maxLen: 20 },
                    { name: 'swDesc', alignment: 'left', maxLen: 20 },
                    { name: 'date', alignment: 'left' },
                    { name: 'correctDate', alignment: 'left' },
                    { name: 'amount', alignment: 'right' },
                    { name: 'correctAmount', alignment: 'right' },
                    { name: 'notes', maxLen: 40 },
                ],
            })
            existed.forEach((u) => {
                tab.addRow(
                    {
                        matches: u.matches ? '✓' : '✕',
                        lmPayee: display(u.lmPayee, 20),
                        swDesc: display(u.swDesc, 20),
                        date: u.date,
                        correctDate: u.correctDate,
                        amount: u.amount,
                        correctAmount: u.correctAmount,
                        notes: display(u.notes, 0),
                    },
                    { color: u.matches ? undefined : 'red' }
                )
            })
            tab.printTable()
        }

        return
    }
}

type SplitwiseToLMUpdateData = {
    matches: boolean
    lmPayee: string
    swDesc: string
    date: string
    amount: string
    notes?: string
    correctDate?: string
    correctAmount?: string
}

const getSwToLMUpdateData = (
    exp: SplitwiseExpense & { userPayment: string },
    tr: LMTransaction
) => {
    let matchedAmount = money(tr.amount) === money(exp.userPayment)
    let trDate = new Date(tr.date).toISOString().split('T')[0]
    let swDate = new Date(exp.date).toISOString().split('T')[0]
    let matchedDate = trDate === swDate
    let matchedPayee = tr.payee === exp.description

    let res: SplitwiseToLMUpdateData = {
        matches: matchedAmount && matchedDate,
        lmPayee: display(tr.payee),
        swDesc: exp.description,
        date: trDate,
        amount: money(tr.amount),
        notes: tr.notes,
    }

    if (matchedAmount && matchedDate) {
        return res
    }

    if (!matchedDate) res.correctDate = swDate
    if (!matchedAmount) {
        res.correctAmount = exp.userPayment
        res.notes = `Splitwise: ${exp.cost} from ${exp.created_by.first_name} (UPDATE). ${
            tr.notes || ''
        }`
    }

    return res
}
