import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { SplitwiseApi } from "../../splitwise/splitwise-api.js";
import { printTable } from 'console-table-printer';
import { money, shorten } from "../cli-utils/write-stuff.js";
import { getLogger } from "../cli-utils/logger.js";
import { splitwiseToLMWithUpdates } from "../../splitwise/splitwise-to-lm.js";
import { getEnvVarNum } from "../../utils/env-vars.js";
import { LMError } from "../../utils/errors.js";
const logger = getLogger();
export const getSplitwiseExpensesCommand = () => {
    const program = new Command();
    return program
        .command('list-sw-expenses')
        .option('-s, --start <date>', 'Start date')
        .option('-e, --end <date>', 'End date')
        .option('--no-group', 'Get all expenses, not just those in the provided group.')
        .option('--no-filter-self', 'Include expenses created by the current user.')
        .option('--no-filter-payment', 'Include payments.')
        .action(programWrapper(async (_opts, command) => {
        const { start, end, filterPayment, filterSelf, verbose } = command.optsWithGlobals();
        if (verbose)
            logger.level = 'verbose';
        const sw = new SplitwiseApi();
        await sw.init();
        const res = await sw.getFilteredExpenses({
            dateAfter: start,
            dateBefore: end,
            filterDeleted: true,
            filterPayment,
            filterSelf,
        });
        printTable(res.map((e) => {
            const userPayment = e.repayments.find((repayment) => repayment.from === sw.userId)?.amount;
            return {
                id: e.id,
                date: e.date.split('T')[0],
                cost: money(e.cost),
                description: shorten(e.description, 40),
                user: e.created_by.first_name,
                userPayment: userPayment ? money(userPayment) : '---',
            };
        }));
    }));
};
export const splitwiseToLMCommand = () => {
    const program = new Command();
    return program
        .command('splitwise-to-lm')
        .option('-a, --asset-id <number>', 'Asset ID to add transactions to', parseInt)
        .option('-s, --start <date>', 'Start date')
        .option('-e, --end <date>', 'End date')
        .option('--no-filter-self', 'Include expenses created by the current user.')
        .option('-t, --tag <string...>', 'Tag(s) to add to each transaction', (val) => val.split(',').map((s) => s.trim()), ['splitwise-imported'])
        .option('--dry-run', 'Print transactions to console instead of adding them')
        .action(programWrapper(async (_opts, command) => {
        let { start, end, tag, filterSelf, dryRun, verbose, assetId: assetIdOpts, } = command.optsWithGlobals();
        if (verbose)
            logger.level = 'verbose';
        if (start && !end)
            end = new Date().toISOString().split('T')[0];
        let assetId = assetIdOpts;
        if (!assetId) {
            try {
                assetId = getEnvVarNum('LM_SW_ASSET_ID');
            }
            catch (e) {
                throw new LMError('No asset ID provided; either provide it with --asset-id or set LM_SW_ASSET_ID env variable', 'config');
            }
            logger.info(`Using asset ID ${assetId} from LM_SW_ASSET_ID environment variable`);
        }
        await splitwiseToLMWithUpdates({
            start,
            end,
            filterSelf,
            tag,
            dryRun,
            assetId,
        });
        // if (res) logger.info(`Added ${res.ids.length} transactions to LunchMoney`)
    }));
};
