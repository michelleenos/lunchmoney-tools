import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { writeJson } from '../../utils/files.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { printTransactions } from '../cli-utils/print.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { ChildCommandType } from '../index.ts'

let logger = getLogger()
export const getTransactionsCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-transactions')
        .option('-s, --start <date>', 'Start date for transactions')
        .option('-e, --end <date>', 'End date for transactions')
        .option('-t, --tag-id <number>', 'Filter transactions by tag ID', parseInt)
        .option('-c, --cat-id <number>', 'Filter transactions by category ID', parseInt)
        .option('-a, --asset <number>', 'Filter transactions by asset ID', parseInt)
        .option('-p, --plaid <number>', 'Filter transactions by Plaid account ID', parseInt)
        .option('--show-notes', 'Show transaction notes')
        .option('--show-ext-id', 'Show transaction external ID')
        .option('--show-tags', 'Show transaction tags')
        .option('--no-show-category')
        .option('--no-show-account')
        .option('--no-show-id')
        .option('--search <string>', 'Search transactions by payee')
        .option(
            '--write-file [directory]',
            'Write transactions to a json file instead of printing to console'
        )
        .option('-r, --reviewed', 'only return reviewed transactions')
        .option('-u, --no-reviewed', 'only return unreviewed transactions')
        .action(
            programWrapper(async (_options, command) => {
                const opts = command.optsWithGlobals()
                const { writeFile, search, verbose, apiKey } = opts

                if (verbose) logger.level = 'verbose'

                const lm = new LunchMoneyApi(apiKey)
                let res = await lm.getTransactions({
                    start_date: opts.start,
                    end_date: opts.end,
                    asset_id: opts.asset,
                    category_id: opts.catId,
                    tag_id: opts.tagId,
                    plaid_account_id: opts.plaid,
                    status:
                        opts.reviewed === false
                            ? 'uncleared'
                            : opts.reviewed === true
                            ? 'cleared'
                            : undefined,
                })

                let transactions = res.transactions

                if (search) {
                    logger.info(
                        `Retrieved ${transactions.length} transactions before search. Searching "${search}"`
                    )
                    transactions = lm.searchTransactions(transactions, search)
                    logger.info(`Found ${transactions.length} transactions matching "${search}"`)
                }

                if (writeFile) {
                    let dir = typeof writeFile === 'string' ? writeFile : '.data'
                    let file = `${Date.now()}-transactions.json`
                    await writeJson(dir, file, transactions)
                    console.log(`Wrote transactions to ${dir}/${file}`)
                } else {
                    printTransactions(transactions, {
                        id: opts.showId,
                        date: true,
                        payee: true,
                        amount: true,
                        tags: opts.showTags,
                        category: opts.showCategory,
                        account: opts.showAccount,
                        notes: opts.showNotes,
                        externalId: opts.showExtId,
                    })
                }
            })
        )
}

export const getTransactionCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-transaction <id>')
        .description('Get a specific transaction by ID')
        .option('--show-ext-id', 'Show transaction external ID')
        .option('--show-tags', 'Show transaction tags')
        .option('--no-show-category')
        .option('--no-show-account')
        .option('--no-show-id')
        .option('--show-notes', 'Show transaction notes')
        .option(
            '--write-file [directory]',
            'Write transaction to a json file instead of printing to console'
        )
        .action(
            programWrapper(async (id, _opts, command) => {
                const opts = command.optsWithGlobals()
                const { writeFile, verbose, apiKey } = opts
                if (verbose) logger.level = 'verbose'

                const lm = new LunchMoneyApi(apiKey)
                const transaction = await lm.getTransaction(parseInt(id))

                if (writeFile) {
                    let dir = typeof writeFile === 'string' ? writeFile : '.data'
                    let file = `${Date.now()}-transaction-${id}.json`
                    await writeJson(dir, file, transaction)
                    console.log(`Wrote transaction to ${dir}/${file}`)
                }

                printTransactions([transaction], {
                    id: opts.showId,
                    date: true,
                    payee: true,
                    amount: true,
                    tags: opts.showTags,
                    category: opts.showCategory,
                    account: opts.showAccount,
                    notes: opts.showNotes,
                    externalId: opts.showExtId,
                })
            })
        )
}
