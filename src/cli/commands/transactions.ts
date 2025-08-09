import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { printTransactions } from '../cli-utils/print.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { writeJson } from '../../utils/files.ts'
import { ChildCommandType } from '../index.ts'
import { getLogger } from '../cli-utils/logger.ts'

let logger = getLogger()
export const getTransactionsCommand = () => {
    const program: ChildCommandType = new Command()

    return (
        program
            .command('get-transactions')
            .option('-s, --start <date>', 'Start date for transactions')
            .option('-e, --end <date>', 'End date for transactions')
            .option('-t, --tag-id <number>', 'Filter transactions by tag ID', parseInt)
            .option('-c, --cat-id <number>', 'Filter transactions by category ID', parseInt)
            .option('-a, --asset <number>', 'Filter transactions by asset ID', parseInt)
            .option('-p, --plaid <number>', 'Filter transactions by Plaid account ID', parseInt)
            .option('--show-notes', 'Show transaction notes')
            .option('--show-external-id', 'Show transaction external ID')
            .option('--no-show-tags')
            .option('--no-show-category')
            .option('--no-show-account')
            .option('--no-show-id')
            .option('--search <string>', 'Search transactions by payee')
            .option('--write-file [folder]', 'Write transactions to a file')
            // .option(
            //     '--show <fields...>',
            //     'Comma-separated list of fields to show (id,date,payee,amount,tags,category,account,notes,external_id)',
            //     (val) => val.split(',').map((s) => s.trim())
            // )
            .option('-r, --reviewed', 'only return reviewed transactions')
            .option('-u, --no-reviewed', 'only return unreviewed transactions')
            .action(
                programWrapper(async (_options, command) => {
                    const opts = command.optsWithGlobals()
                    const {
                        start,
                        end,
                        asset,
                        tagId,
                        plaid,
                        reviewed,
                        catId,
                        writeFile,
                        search,
                        verbose,
                    } = opts

                    if (verbose) logger.level = 'verbose'

                    const lm = new LunchMoneyApi()
                    let res = await lm.getTransactions({
                        start_date: start,
                        end_date: end,
                        asset_id: asset,
                        category_id: catId,
                        tag_id: tagId,
                        plaid_account_id: plaid,
                        status:
                            reviewed === false
                                ? 'uncleared'
                                : reviewed === true
                                ? 'cleared'
                                : undefined,
                    })

                    let transactions = res.transactions

                    if (search) {
                        const searchTerm = search.toLowerCase()
                        transactions = transactions.filter((t) =>
                            t.payee?.toLowerCase().includes(searchTerm)
                        )
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
                            externalId: opts.showExternalId,
                        })
                    }
                })
            )
    )
}
