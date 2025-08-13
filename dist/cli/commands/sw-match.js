import { Command } from '@commander-js/extra-typings';
import { Table } from 'console-table-printer';
import { LunchMoneyApi } from "../../api.js";
import { SplitwiseApi } from "../../splitwise/splitwise-api.js";
import { getEnvVarNum } from "../../utils/env-vars.js";
import { getLogger } from "../cli-utils/logger.js";
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { money } from "../cli-utils/write-stuff.js";
let logger = getLogger();
export const splitwiseMatchLMCommand = () => {
    const program = new Command();
    let today = new Date().toISOString().split('T')[0];
    return program
        .command('sw-match')
        .option('-s, --start <date>', 'Start date')
        .option('-e, --end <date>', 'End date')
        .option('--sw-group-id <number>', 'Splitwise group ID', parseInt)
        .option('--sw-api-key <string>', 'Splitwise API key')
        .action(programWrapper(async (_opts, command) => {
        const { start, end, verbose, swGroupId, swApiKey } = command.optsWithGlobals();
        const sw = new SplitwiseApi(swApiKey, swGroupId);
        await sw.init();
        const lm = new LunchMoneyApi();
        if (verbose)
            logger.level = 'verbose';
        const swExpenses = await sw.getFilteredExpenses({
            dateAfter: start,
            dateBefore: end,
        });
        const lmTransactions = await lm.getTransactions({
            start_date: start,
            end_date: end,
            asset_id: getEnvVarNum('LM_SW_ASSET_ID'),
        });
        const table = new Table();
        for (const expense of swExpenses) {
            const userPayment = expense.repayments.find((repayment) => repayment.from === sw.userId)?.amount;
            if (userPayment === undefined) {
                console.warn(`No payment found for user in expense "${expense.description}", skipping`);
                continue;
            }
            let tr = lmTransactions.transactions.find((t) => t.external_id === expense.id.toString() ||
                t.external_id === `splitwise-${expense.id}`);
            // if (!tr) {
            //     tr = lmTransactions.transactions.find((t) => {
            //         if (t.payee !== expense.description) return false
            //         if (money(t.amount) !== money(userPayment)) return false
            //         // if (t.external_id !== expense.id.toString()) return false
            //         return true
            //     })
            // }
            if (tr) {
                let lmDate = new Date(tr.date).toISOString().split('T')[0];
                let swDate = new Date(expense.date).toISOString().split('T')[0];
                let diff = lmDate !== swDate || money(tr.amount) !== money(userPayment)
                    ? true
                    : false;
                table.addRow({
                    externalId: tr.external_id,
                    swId: expense.id,
                    swDate,
                    lmDate,
                    swDescription: expense.description,
                    lmPayee: tr.payee || '---',
                    swCost: money(expense.cost),
                    swUserPayment: money(userPayment),
                    lmAmount: money(tr.amount),
                }, {
                    color: diff ? 'yellow' : undefined,
                });
            }
            else {
                table.addRow({
                    swId: expense.id,
                    swDate: expense.date.split('T')[0],
                    swDescription: expense.description,
                    swCost: money(expense.cost),
                    swUserPayment: money(userPayment),
                }, {
                    color: 'red',
                });
            }
        }
        table.printTable();
    }));
};
