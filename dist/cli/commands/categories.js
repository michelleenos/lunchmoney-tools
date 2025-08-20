import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../../api.js";
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { getLogger } from "../cli-utils/logger.js";
import { printCategories } from "../cli-utils/print.js";
const logger = getLogger();
export const getCategoriesCommand = () => {
    const program = new Command();
    return program
        .command('get-categories')
        .description('List Lunch Money categories and IDs')
        .option('--no-description', 'Do not show category descriptions')
        .option('--no-id', 'Do not show category IDs')
        .action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey, description, id } = command.optsWithGlobals();
        if (verbose)
            logger.level = Infinity;
        const lm = new LunchMoneyApi(apiKey);
        const res = await lm.getCategories('nested');
        const cats = res.categories;
        printCategories(cats, { isNested: true, showDescription: description, showId: id });
    }));
};
