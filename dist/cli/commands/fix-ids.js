import { Command } from '@commander-js/extra-typings';
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { LunchMoneyApi } from "../../api.js";
import { getEnvVarNum } from "../../utils/env-vars.js";
import { getLogger } from "../cli-utils/logger.js";
const logger = getLogger();
export const fixIdsCommand = () => {
    const program = new Command();
    return program.command('fix-external-ids').action(programWrapper(async () => {
        const lm = new LunchMoneyApi();
        const res = await lm.getTransactions({
            asset_id: getEnvVarNum('LM_SW_ASSET_ID'),
            start_date: '2025-01-01',
            end_date: '2025-08-10',
        });
        for (const tr of res.transactions) {
            if (tr.external_id && !tr.external_id.startsWith('splitwise-')) {
                logger.warn(`Updating transaction ${tr.id}: ${tr.payee}, amount: ${tr.amount}`);
                let update = await lm.updateTransaction(tr.id, {
                    external_id: `splitwise-${tr.external_id}`,
                });
                if (update.updated) {
                    logger.info(`Updated transaction ${tr.id} with new external_id`);
                }
                else {
                    logger.error(`Failed to update transaction ${tr.id}`);
                }
            }
        }
    }));
};
