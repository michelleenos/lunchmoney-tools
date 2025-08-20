import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../../api.js";
import { getLogger } from "../cli-utils/logger.js";
import { printTags } from "../cli-utils/print.js";
import { programWrapper } from "../cli-utils/program-wrapper.js";
const logger = getLogger();
export const getTagsCommand = () => {
    const program = new Command();
    return program
        .command('get-tags')
        .description('List Lunch Money tags with descriptions and IDs')
        .option('-s, --sort', 'Sort tags alphabetically by name')
        .option('--no-archived', 'Do not display archived tags')
        .option('--no-description', 'Do not display tag descriptions')
        .option('--no-id', 'Do not display tag IDs')
        .action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey, archived, sort, description, id } = command.optsWithGlobals();
        if (verbose)
            logger.level = Infinity;
        const lm = new LunchMoneyApi(apiKey);
        const tags = await lm.getTags({ archived });
        printTags(tags, {
            showArchived: archived,
            sort,
            showId: id,
            showDescription: description,
        });
    }));
};
