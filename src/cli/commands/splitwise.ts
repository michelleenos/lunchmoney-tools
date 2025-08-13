import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { printTable, type Table } from 'console-table-printer'
import { SplitwiseApi } from '../../splitwise/splitwise-api.ts'
import { splitwiseToLMWithUpdates } from '../../splitwise/splitwise-to-lm.ts'
import { getEnvVarNum } from '../../utils/env-vars.ts'
import { LMError } from '../../utils/errors.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { display, money } from '../cli-utils/write-stuff.ts'
import { RootProgramOpts } from '../index.ts'

const logger = getLogger()

export const getSplitwiseExpensesCommand = () => {
    const program = new Command<[], {}, RootProgramOpts>()

    return program
        .command('list-sw-expenses')
        .option('-s, --start-date <date>')
        .option('-e, --end-date <date>')
        .option('--no-filter-self', 'Include expenses created by the current user.')
        .option('--no-filter-payment', 'Include payments.')
        .option('--group <id>', 'Splitwise group ID', parseInt)
        .option('--no-group', 'Do not try to use SW_GROUP_ID environment variable')
        .option('--sw-api-key <string>', 'Splitwise API key')

        .action(
            programWrapper(async (_opts, command) => {
                const opts = command.optsWithGlobals()
                const { filterPayment, filterSelf, verbose, swApiKey, group } = opts
                if (verbose) logger.level = 'verbose'

                const sw = new SplitwiseApi(swApiKey, group)
                await sw.init()
                const res = await sw.getFilteredExpenses({
                    dateAfter: opts.startDate,
                    dateBefore: opts.endDate,
                    filterDeleted: true,
                    filterPayment,
                    filterSelf,
                })

                printTable(
                    res.map((e) => {
                        const userPayment = e.repayments.find(
                            (repayment) => repayment.from === sw.userId
                        )?.amount

                        return {
                            id: e.id,
                            date: e.date.split('T')[0],
                            cost: money(e.cost),
                            description: display(e.description, 40),
                            user: e.created_by.first_name,
                            userPayment: userPayment ? money(userPayment) : '---',
                        }
                    })
                )
            })
        )
}

// const handleDupesHelp = `
// The script will check for existing transactions in Lunch Money that have an \`external_id\` matching the Splitwise expense ID.
// When --handle-dupes is set to 'update', if a match is found, the script will check to ensure the amount and date still match data from Splitwise, and update the transaction if not.
// When set to 'skip', it will simply skip existing transactions and not attempt to create or update them.
// Note this is different from the \`skip_duplicates\` option in LMInsertTransactionsSettings, which toggles deduping behavior on the Lunch Money server side.
// `
export const splitwiseToLMCommand = () => {
    const program = new Command<[], {}, RootProgramOpts>()

    return program
        .command('splitwise-to-lm')
        .option('-a, --asset-id <number>', 'Lunch Money asset ID for Splitwise imports', parseInt)
        .option('-s, --start-date <date>', 'Start date')
        .option('-e, --end-date <date>', 'End date')
        .option(
            '-t, --tag <string...>',
            'Tag(s) to add to each transaction',
            (val) => val.split(',').map((s) => s.trim()),
            ['splitwise-imported']
        )
        .option('--handle-dupes <option>', '"update" or "skip" (default "update")', 'update')
        .option('--no-filter-self', 'Include expenses created by the current user.')
        .option(
            '--group <id>',
            'Splitwise group ID. If not provided, will use SW_GROUP_ID env var',
            parseInt
        )
        .option(
            '--sw-api-key <string>',
            'Splitwise API key. If not provided, will use SW_API_KEY env var'
        )
        .option('--dry-run', 'Print transactions to console instead of adding them')
        .action(
            programWrapper(async (_opts, command) => {
                const opts = command.optsWithGlobals()
                let { startDate, endDate, handleDupes, verbose, apiKey } = opts
                if (verbose) logger.level = 'verbose'
                if (startDate && !endDate) endDate = new Date().toISOString().split('T')[0]

                if (handleDupes !== 'update' && handleDupes !== 'skip') {
                    throw new LMError(
                        `Unrecognized --handle-dupes option: ${handleDupes}. Must be 'update' or 'skip'.`,
                        'config'
                    )
                }

                await splitwiseToLMWithUpdates({
                    startDate,
                    endDate,
                    filterSelf: opts.filterSelf,
                    tag: opts.tag,
                    dryRun: opts.dryRun,
                    assetId: opts.assetId,
                    swGroupId: opts.group,
                    lmApiKey: apiKey,
                    swApiKey: opts.swApiKey,
                    handleDupes,
                })
            })
        )
}
