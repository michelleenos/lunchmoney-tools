import { LunchMoneyApi } from '../api.ts'
import { getLogger } from '../logger.ts'
import { LMTransaction } from '../types/index.ts'
import { parseCsv } from './parse-csv.ts'
import { searchTransactions } from './search-transactions.ts'
import { AmazonCSVData, TransformedAmazonData } from './types.ts'

const logger = getLogger()

const simplifyItems = (str: string) => {
    return str
        .split(';')
        .map((item) => item.trim())
        .filter((item) => item.length > 0)
        .map((item) => item.slice(0, 35))
        .join(' | ')
}

export interface AmazonToLMOpts {
    /**
     * path to CSV file from Amazon order scraper
     */
    filePath: string
    filters?: {
        /**
         * to field (exact match)
         */
        to?: string
        /**
         * payment field (contains)
         */
        payment?: string
    }
    /**
     * tags to add to LM transaction
     * @default ['amazon-link']
     */
    tags?: string[]
    /**
     * exclude LM transactions with this tag
     * @default ['amazon-link']
     */
    excludeTags?: string[]
    startDate?: string
    endDate?: string
    verbose?: boolean
    dryRun?: boolean
}

export const amazonToLM = async (
    lunchMoney: LunchMoneyApi,
    {
        filters,
        tags = ['amazon-link'],
        excludeTags = ['amazon-link'],
        startDate,
        endDate,
        verbose = false,
        filePath,
        dryRun = false,
    }: AmazonToLMOpts,
) => {
    if (verbose) logger.level = Infinity

    const { transformedRows: orders, rowsWithIssues } = await parseAmazonData({
        filters,
        startDate,
        endDate,
        filePath,
    })

    if (!orders || orders.length === 0) {
        logger.warn('No Amazon orders provided for conversion to Lunch Money transactions.')
        return false
    }

    const transactionsRes = await lunchMoney.getTransactions({
        start_date: startDate,
        end_date: endDate,
        pending: false,
    })

    let lmTransactions = transactionsRes.transactions
    if (excludeTags) {
        lmTransactions = lmTransactions.filter((t) => {
            if (t.tags && t.tags.some((tag) => excludeTags.includes(tag.name))) {
                return false
            }
            return true
        })
    }

    logger.verbose(`🔍 Found ${lmTransactions.length} Lunch Money transactions`)

    let i = -1

    const unmatched: TransformedAmazonData[] = []
    const extraMatches: { data: TransformedAmazonData; matches: LMTransaction[] }[] = []
    const errors: {
        amazon: TransformedAmazonData
        lunchMoney: LMTransaction
        error?: any
    }[] = []
    const successes: { amazon: TransformedAmazonData; lunchMoney: LMTransaction }[] = []

    logger.verbose(
        `Analyzing ${orders.length} Amazon orders, looking for matches in ${lmTransactions.length} Lunch Money transactions...`,
    )

    for (const order of orders) {
        i++

        const matchingTransactions = searchTransactions(lmTransactions, {
            date: order.date,
            amount: order.total,
            name: 'amazon',
        })

        if (matchingTransactions.length > 1) {
            logger.warn(
                `❗ Found ${matchingTransactions.length} matching transactions for order with date ${order.date} and id ${order.orderId}`,
            )
            extraMatches.push({ data: order, matches: matchingTransactions })
        } else if (matchingTransactions.length === 1) {
            const transaction = matchingTransactions[0]

            let itemsStr = simplifyItems(order.items)

            logger.verbose(
                `✨ Found matching transaction for order date ${order.date} with ID ${order.orderId}`,
            )
            logger.verbose(`		Items: ${itemsStr}`)

            if (dryRun) {
                successes.push({ amazon: order, lunchMoney: transaction })
                continue
            }
            try {
                // let notes = `${itemsStr} - ${order.orderUrl.split('&ref')[0]}`
                let notes = `${transaction.notes ? transaction.notes + ' | ' : ''}${order.orderUrl.split('&ref')[0]}`
                let payee = `${transaction.payee || 'Amazon'} - ${itemsStr}`
                await lunchMoney.updateTransaction(transaction.id, {
                    notes,
                    payee,
                    addTags: tags,
                })

                logger.info(`🎉 Updated transaction ${transaction.id} with notes ${notes}`)
                successes.push({ amazon: order, lunchMoney: transaction })
            } catch (error) {
                logger.error(`🔴 Error updating transaction ${transaction.id}:`, error)
                errors.push({ amazon: order, lunchMoney: transaction, error })
            }
        } else {
            logger.warn(`😔 Can't find matching transaction for order with ID ${order.orderId}`)
            unmatched.push(order)
        }
    }

    return { successes, errors, extraMatches, unmatched, rowsWithIssues }
}

async function parseAmazonData({
    filters: { to: toField, payment: paymentContains } = {},
    startDate,
    endDate,
    filePath,
}: Omit<AmazonToLMOpts, 'verbose'>) {
    logger.verbose(`Parsing Amazon orders from file: ${filePath}`)

    const data = await parseCsv<AmazonCSVData>(filePath)

    const transformedRows: TransformedAmazonData[] = []
    const rowsWithIssues: Omit<AmazonCSVData, 'payments' | 'to'>[] = []

    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const lastRow = data[data.length - 1]
    if (lastRow && lastRow['total']?.toLowerCase().includes('subtotal')) {
        data.pop()
    }

    let filteredTo = 0
    let filteredPayments = 0
    let filteredDate = 0

    data.forEach((row) => {
        if (!row['order id'] || !row['order url'] || !row.total || !row.date || !row.items) {
            logger.warn(
                `⚠️ Skipping row because it does not contain all required fields: ${JSON.stringify(row)}`,
            )
            rowsWithIssues.push({ ...row })
            return
        }

        if (toField && row.to !== toField) {
            filteredTo++
            return
        }

        if (
            paymentContains &&
            (!row.payments || !row.payments.toLowerCase().includes(paymentContains.toLowerCase()))
        ) {
            filteredPayments++
            return
        }

        const orderDate = new Date(row.date)
        if ((start && orderDate < start) || (end && orderDate > end)) {
            filteredDate++
            return
        }

        transformedRows.push({
            orderId: row['order id'],
            orderUrl: row['order url'],
            total: row.total,
            date: row.date,
            items: row.items,
            payments: row.payments,
            to: row.to,
        })
    })

    logger.info(
        `Parsed ${transformedRows.length} Amazon orders successfully out of ${data.length} rows.`,
    )

    return { transformedRows, rowsWithIssues }
}
