import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { printTable, Table } from 'console-table-printer'
import { SplitwiseApi } from '../../splitwise/splitwise-api.ts'
import { splitwiseToLMWithUpdates } from '../../splitwise/splitwise-to-lm.ts'
import { getEnvVarNum } from '../../utils/env-vars.ts'
import { LMError } from '../../utils/errors.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { display, money } from '../cli-utils/write-stuff.ts'
import { ChildCommandType, RootProgramOpts } from '../index.ts'
import { lmToSplitwise } from '../../splitwise/lm-to-splitwise.ts'

const logger = getLogger()

export const getSplitwiseExpensesCommand = () => {
    const program = new Command<[], {}, RootProgramOpts>()

    return program
        .command('list-sw-expenses')
        .description('List Splitwise expenses with optional filtering')
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
                if (verbose) logger.level = Infinity

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

export const getSplitwiseGroupCommand = () => {
    const program: ChildCommandType = new Command()
    return program
        .command('get-splitwise-group')
        .description('Display information about members of a Splitwise group')
        .option(
            '--group-id <id>',
            'Splitwise group ID. If not provided, will use SW_GROUP_ID env var',
            parseInt
        )
        .option(
            '--sw-api-key <string>',
            'Splitwise API key. If not provided, will use SW_API_KEY env var'
        )
        .action(
            programWrapper(async (_opts, command) => {
                const opts = command.optsWithGlobals()
                const { verbose, swApiKey, groupId } = opts
                if (verbose) logger.level = Infinity

                const sw = new SplitwiseApi(swApiKey, groupId)
                await sw.init()
                const groupData = await sw.getCurrentGroup()
                const group = groupData.group

                printTable(
                    group.members.map((member) => {
                        return {
                            id: member.id,
                            name: member.first_name,
                            balance: member.balance.map((a) => money(a.amount)).join(', '),
                        }
                    }),
                    { title: `Splitwise Group ${group.name} - ID: ${group.id}` }
                )
            })
        )
}

export const splitwiseToLMCommand = () => {
    const program = new Command<[], {}, RootProgramOpts>()

    return program
        .command('splitwise-to-lm')
        .description('Import Splitwise expenses to Lunch Money as transactions')
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
        .option(
            '--no-filter-self',
            'By default, we will filter out expenses created by the current user; use this flag to include them.'
        )
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
                if (verbose) logger.level = Infinity
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

export const lmToSplitwiseCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('lm-to-splitwise')
        .description('Import Lunch Money transactions to a Splitwise group')
        .requiredOption(
            '-t, --tag-id <number>',
            'Lunch Money tag ID to pull transactions from (required)',
            parseInt
        )
        .option('-s, --start-date <date>', 'Start date')
        .option('-e, --end-date <date>', 'End date')
        .option(
            '--exclude-tags <string...>',
            'Tag(s) to exclude, comma-separated',
            (val) => val.split(',').map((s) => s.trim()),
            ['splitwise-auto-added']
        )
        .option('--add-tag <string>', 'Tag to add to Splitwise expenses', 'splitwise-auto-added')
        .option(
            '--shares <string...>',
            'User shares for unequal split. write in format "userId=sharePercent"',
            collectShares
        )
        .option('--remove-tag', 'Remove the tag from the LM transaction after adding to Splitwise')
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
                let { startDate, endDate, verbose, apiKey, tagId, excludeTags } = opts
                if (verbose) logger.level = Infinity
                if (startDate && !endDate) endDate = new Date().toISOString().split('T')[0]

                await lmToSplitwise({
                    startDate,
                    endDate,
                    tagId,
                    excludeTags,
                    removeTag: opts.removeTag,
                    unequalShares: opts.shares,
                    dryRun: opts.dryRun,
                    lmApiKey: apiKey,
                    swApiKey: opts.swApiKey,
                    swGroupId: opts.group,
                })
            })
        )
    function collectShares(value: string, previous: { id: number; percent: number }[] = []) {
        const [idStr, percentStr] = value.split('=')
        const id = parseInt(idStr)
        const percent = parseFloat(percentStr)

        if (isNaN(id) || isNaN(percent)) {
            program.error(`Invalid share format: ${value}. Use "userId=sharePercent".`, {
                exitCode: 1,
            })
        }

        return previous.concat([{ id, percent }])
    }
}
