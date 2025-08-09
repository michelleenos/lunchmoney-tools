import { Logger } from 'winston'
import { SplitwiseApi } from './splitwise-api.ts'
import { LunchMoneyApi } from '../api.ts'
import { money, shorten } from '../cli/cli-utils/write-stuff.ts'
import { LMInsertTransactionObject, LMTransaction } from '../types/index.ts'
import { SplitwiseExpense } from './types.ts'
import { LMError } from '../utils/errors.ts'
import { printTable, Table } from 'console-table-printer'
import { writeJson } from '../utils/files.ts'
import { getLogger } from '../cli/cli-utils/logger.ts'
import { getEnvVarNum, getEnvVarString } from '../utils/env-vars.ts'

interface SplitwiseToLMOpts {
    start?: string
    end?: string
    assetId: number
    tag?: string | string[]
    filterSelf?: boolean
    filterPayment?: boolean
    dryRun?: boolean
}

const logger = getLogger()

export const splitwiseToLM = async ({
    start,
    end,
    assetId,
    tag = 'splitwise-imported',
    filterSelf = true,
    filterPayment = true,
    dryRun,
}: SplitwiseToLMOpts) => {
    const lm = new LunchMoneyApi()
    const sw = new SplitwiseApi()
    await sw.init()

    const expenses = await sw.getFilteredExpenses({
        dateAfter: start,
        dateBefore: end,
        filterDeleted: true,
        filterPayment,
        filterSelf,
    })

    logger.info(`Found ${expenses.length} filtered expenses from Splitwise`)

    const transactions: LMInsertTransactionObject[] = []
    const skipped: SplitwiseExpense[] = []

    for (const expense of expenses) {
        const { id, description, date, cost, repayments, created_by, details } = expense
        const userPayment = repayments.find((repayment) => repayment.from === sw.userId)?.amount
        if (userPayment === undefined) {
            logger.warn(
                `No payment found for user in expense "${shorten(description, 30)}", skipping`
            )
            skipped.push(expense)
            continue
        }

        const userAmount = parseFloat(userPayment).toFixed(2)

        transactions.push({
            date,
            payee: description,
            tags: Array.isArray(tag) ? tag : [tag],
            asset_id: assetId,
            amount: userAmount,
            notes: `Splitwise: ${cost} from ${created_by.first_name}. ${details || ''}`,
            external_id: id.toString(),
        })
    }

    if (skipped.length > 0) {
        logger.warn(
            `Skipped ${skipped.length} expenses which did not have a payment from the current user.`
        )
    }

    if (dryRun) {
        printTable(
            transactions.map((t) => ({
                date: t.date,
                payee: shorten(t.payee || 'Unknown', 30),
                amount: t.amount,
                notes: shorten(t.notes || '', 40),
                external_id: t.external_id,
            })),
            {
                title: `Dry run: ${transactions.length} transactions to be added in Lunch Money`,
            }
        )
        return
    }

    return await lm.createTransactions(transactions, {
        apply_rules: true,
        check_for_recurring: true,
        skip_duplicates: true,
        skip_balance_update: false,
    })
}

export const splitwiseToLMWithUpdates = async ({
    start,
    end,
    assetId,
    tag = 'splitwise-imported',
    filterSelf = true,
    filterPayment = true,
    dryRun,
}: SplitwiseToLMOpts) => {
    const lm = new LunchMoneyApi()
    const sw = new SplitwiseApi()
    await sw.init()

    const expenses = await sw.getFilteredExpenses({
        dateAfter: start,
        dateBefore: end,
        filterDeleted: true,
        filterPayment,
        filterSelf,
    })

    const lmRes = await lm.getTransactions({
        end_date: end,
        start_date: start,
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

    for (const expense of expensesWithPayment) {
        const { id, description, date, cost, repayments, created_by, details, userPayment } =
            expense

        const existing = transactions.find(
            (t) => t.external_id === `splitwise-${id}` || t.external_id === id.toString()
        )

        if (existing) {
            await updateLMItemToMatchSW(lm, expense, existing, dryRun)
        } else {
            const newTransaction: LMInsertTransactionObject = {
                date,
                payee: description,
                tags: Array.isArray(tag) ? tag : [tag],
                asset_id: assetId,
                amount: userPayment,
                notes: `Splitwise: ${cost} from ${created_by.first_name}. ${details || ''}`,
                external_id: `splitwise-${id}`,
            }

            if (dryRun) {
                console.log('Dry run - would add transaction:', newTransaction)
            } else {
                let res = await lm.createTransactions([newTransaction], {
                    apply_rules: true,
                    check_for_recurring: true,
                    skip_duplicates: true,
                    skip_balance_update: false,
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

    // return await lm.createTransactions(transactions, {
    //     apply_rules: true,
    //     check_for_recurring: true,
    //     skip_duplicates: true,
    //     skip_balance_update: false,
    // })
}

export const splitwiseToLMItem = async (
    lm: LunchMoneyApi,
    exp: SplitwiseExpense & { userPayment: string },
    trs: LMTransaction[],
    dryRun = false
) => {
    const { id, description, userPayment, date, cost, repayments, created_by, details } = exp

    const existing = trs.find(
        (t) => t.external_id === `splitwise-${id}` || t.external_id === id.toString()
    )
}

export const updateLMItemToMatchSW = async (
    lm: LunchMoneyApi,
    exp: SplitwiseExpense & { userPayment: string },
    tr: LMTransaction,
    dryRun = false
) => {
    let matchedAmount = money(tr.amount) === money(exp.userPayment)
    let trDate = new Date(tr.date).toISOString().split('T')[0]
    let swDate = new Date(exp.date).toISOString().split('T')[0]
    let matchedDate = trDate === swDate
    let matchedPayee = tr.payee === exp.description

    if (matchedAmount && matchedDate) {
        logger.verbose(
            `Splitwise expense "${shorten(
                exp.description,
                30
            )}" is already matched in LunchMoney. Skipping update.`
        )
        return
    }

    const t = new Table({
        title: dryRun ? 'Dry Run: Transaction to Update' : 'Transaction to Update',
    })
    t.addRow({ item: 'id', lm: tr.id, sw: exp.id })
    t.addRow(
        { item: 'amount', lm: tr.amount, sw: exp.userPayment },
        {
            color: matchedAmount ? undefined : 'yellow',
        }
    )
    t.addRow(
        { item: 'date', lm: trDate, sw: swDate },
        {
            color: matchedDate ? undefined : 'yellow',
        }
    )
    t.addRow(
        { item: 'payee', lm: tr.payee, sw: exp.description },
        {
            color: matchedPayee ? undefined : 'yellow',
        }
    )
    if (logger.level === 'verbose') {
        logger.verbose('Transaction details:', t.render())
        // t.printTable()
    }

    if (dryRun) return

    let res = await lm.updateTransaction(tr.id, {
        date: swDate,
        payee: exp.description,
        amount: exp.userPayment,
    })

    if (res.updated) {
        logger.info(`Updated transaction ${tr.id} to match Splitwise expense ${exp.id}`)
    } else {
        throw new LMError(`Failed to update transaction ${tr.id} for Splitwise expense ${exp.id}`)
    }
}
