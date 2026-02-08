import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { writeJson } from '../../utils/files.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { printTransactions } from '../cli-utils/print.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { ChildCommandType } from '../index.ts'
import { LMUpdateTransactionObject } from '../../types/index.ts'

let logger = getLogger()
export const getTransactionsCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-transactions')
        .description('List transactions, with optional filtering')
        .option('-s, --start <date>', 'Start date for transactions')
        .option('-e, --end <date>', 'End date for transactions')
        .option('-t, --tag-id <number>', 'Filter transactions by tag ID', parseInt)
        .option('-c, --cat-id <number>', 'Filter transactions by category ID', parseInt)
        .option('-a, --asset <number>', 'Filter transactions by asset ID', parseInt)
        .option('-p, --plaid <number>', 'Filter transactions by Plaid account ID', parseInt)
        .option('-r, --reviewed', 'only return reviewed transactions')
        .option('-u, --no-reviewed', 'only return unreviewed transactions')
        .option(
            '-l, --limit <number>',
            'Limit number of transactions returned (default 1000)',
            parseInt,
        )
        .option('-o, --offset <number>', 'Offset', parseInt)
        .option('--search <string>', 'Search transactions by payee')
        .option('--show-ext-id', 'Display transaction external ID in output')
        .option('--show-tags', 'Display transaction tags in output')
        .option('--no-show-notes', 'Do not display transaction notes')
        .option('--no-show-category', 'Do not display category in output')
        .option('--no-show-account', 'Do not display account in output')
        .option('--no-show-id', 'Do not display transaction IDs in output')
        .option(
            '--write-file [directory]',
            'Write transactions to a json file instead of printing to console',
        )
        .action(
            programWrapper(async (_options, command) => {
                const opts = command.optsWithGlobals()
                const { writeFile, search, verbose, apiKey } = opts

                if (verbose) logger.level = Infinity

                const lm = new LunchMoneyApi(apiKey)
                let res = await lm.getTransactions({
                    start_date: opts.start,
                    end_date: opts.end,
                    asset_id: opts.asset,
                    category_id: opts.catId,
                    tag_id: opts.tagId,
                    plaid_account_id: opts.plaid,
                    limit: opts.limit,
                    offset: opts.offset,
                    status:
                        opts.reviewed === false
                            ? 'uncleared'
                            : opts.reviewed === true
                              ? 'cleared'
                              : undefined,
                })

                let { transactions, has_more: hasMore } = res

                if (hasMore) {
                    logger.warn(
                        'has_more is true! run the same command with an offset to get the next batch. This time you ' +
                            opts.offset
                            ? `used an offset of ${opts.offset}, `
                            : 'did not use an offset, ' +
                                  `and ${transactions.length} transactions were returned from the API.`,
                    )
                }

                if (search) {
                    logger.verbose(
                        `Retrieved ${transactions.length} transactions before search. Searching "${search}"`,
                    )
                    transactions = lm.searchTransactions(transactions, search)
                    logger.info(`Found ${transactions.length} transactions matching "${search}"`)
                }

                if (writeFile) {
                    let dir = typeof writeFile === 'string' ? writeFile : '.lm-tools-data'
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
            }),
        )
}

export const getTransactionCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-transaction <id>')
        .description('Get a specific transaction by ID')
        .option('--show-ext-id', 'Show transaction external ID')
        .option('--show-tags', 'Show transaction tags')
        .option('--no-show-category', 'Do not show transaction category in output')
        .option('--no-show-account', 'Do not show transaction account in output')
        .option('--no-show-id', 'Do not show transaction ID in output')
        .option('--show-notes', 'Show transaction notes')
        .option(
            '--write-file [directory]',
            'Write transaction to a json file instead of printing to console',
        )
        .action(
            programWrapper(async (id, _opts, command) => {
                const opts = command.optsWithGlobals()
                const { writeFile, verbose, apiKey } = opts
                if (verbose) logger.level = Infinity

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
            }),
        )
}

export const updateTransactionCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('update-transaction <id>')
        .description('Update a single transaction by ID')
        .option('-a, --amount <amount>', 'Set transaction amount')
        .option('-n, --notes <notes>', 'New notes for the transaction')
        .option('-p, --payee <payee>', 'New payee')
        .option('-t, --tags <tag...>', 'New transaction tags (space-separated)')
        .option('-c, --category-id <number>', 'New category ID', parseInt)
        .option('--dry-run', 'Do not actually perform the update, just show what would be done')
        .action(
            programWrapper(async (id, _opts, command) => {
                const opts = command.optsWithGlobals()
                const { verbose, apiKey, dryRun } = opts
                if (verbose) logger.level = Infinity

                const lm = new LunchMoneyApi(apiKey)

                const update: LMUpdateTransactionObject = {}
                if (opts.amount) update.amount = parseFloat(opts.amount)
                if (opts.notes) update.notes = opts.notes
                if (opts.tags) update.tags = opts.tags
                if (opts.categoryId) update.category_id = opts.categoryId
                if (opts.payee) update.payee = opts.payee

                if (dryRun) {
                    logger.info('Dry run enabled, not performing update. Would have updated with:')
                    console.log(JSON.stringify(update, null, 2))
                    return
                }

                const res = await lm.updateTransaction(parseInt(id), update)
                if (res && 'updated' in res) {
                    logger.info(`Updated transaction ${id} successfully`)
                } else {
                    logger.error(`Failed to update transaction ${id}`)
                }
            }),
        )
}
