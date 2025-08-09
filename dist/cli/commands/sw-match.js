import { Command } from '@commander-js/extra-typings';
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { SplitwiseApi } from "../../splitwise/splitwise-api.js";
import { LunchMoneyApi } from "../../api.js";
import { getEnvVarNum } from "../../utils/env-vars.js";
import { money } from "../cli-utils/write-stuff.js";
import { Table } from 'console-table-printer';
import { getLogger } from "../cli-utils/logger.js";
let logger = getLogger();
export const splitwiseMatchLMCommand = () => {
    const program = new Command();
    let today = new Date().toISOString().split('T')[0];
    return program
        .command('sw-match')
        .option('-s, --start <date>', 'Start date (default to 2025-01-01)', '2025-01-01')
        .option('-e, --end <date>', 'End date (default today)', today)
        .action(programWrapper(async (_opts, command) => {
        const sw = new SplitwiseApi();
        await sw.init();
        const lm = new LunchMoneyApi();
        const { start, end, verbose } = command.optsWithGlobals();
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
