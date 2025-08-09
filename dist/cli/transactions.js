import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../api.js";
import { printTransactions } from "./cli-utils/print.js";
import { programWrapper } from "./cli-utils/program-wrapper.js";
export const getTransactionsCommand = () => {
    const program = new Command();
    return program
        .command('get-transactions')
        .option('-s, --start <date>', 'Start date for transactions')
        .option('-e, --end <date>', 'End date for transactions')
        .option('-t, --tag <number>', 'Filter transactions by tag ID', parseInt)
        .option('-c, --category <number>', 'Filter transactions by category ID', parseInt)
        .option('-a, --asset <number>', 'Filter transactions by asset ID', parseInt)
        .option('-p, --plaid <number>', 'Filter transactions by Plaid account ID', parseInt)
        .option('--show <fields...>', 'Comma-separated list of fields to show (id,date,payee,amount,tags,category,account)')
        .option('-r, --reviewed', 'only return reviewed transactions')
        .option('-u, --no-reviewed', 'only return unreviewed transactions')
        .action(programWrapper(async (options) => {
        const { start, end, asset, tag, plaid, reviewed, category, show } = options;
        const lm = new LunchMoneyApi();
        let res = await lm.getTransactions({
            start_date: start,
            end_date: end,
            asset_id: asset,
            category_id: category,
            tag_id: tag,
            plaid_account_id: plaid,
            status: reviewed === false
                ? 'uncleared'
                : reviewed === true
                    ? 'cleared'
                    : undefined,
        });
        const fieldsToShow = show || [
            'id',
            'date',
            'payee',
            'amount',
            'category',
            'account',
        ];
        printTransactions(res.transactions, fieldsToShow);
    }));
};
