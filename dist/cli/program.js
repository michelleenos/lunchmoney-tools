import { Command } from '@commander-js/extra-typings';
import { getTransactionCommand, getTransactionsCommand, updateTransactionCommand, } from "./commands/transactions.js";
import { getAccountsCommand, getAssetsCommand, getPlaidAccountsCommand, } from "./commands/accounts.js";
import { getSplitwiseExpensesCommand, getSplitwiseGroupCommand, lmGroupToSplitwiseCommand, lmToSplitwiseCommand, splitwiseToLMCommand, } from "./commands/splitwise.js";
import { getCategoriesCommand } from "./commands/categories.js";
import { getTagsCommand } from "./commands/tags.js";
import { amazonToLMCommand } from "./commands/amazon.js";
export const createProgram = () => {
    const program = new Command()
        .name('lm-tools')
        .option('-v, --verbose', 'Enable verbose logging')
        .option('--api-key <KEY>', 'Lunch Money API key (if not set will look for LM_API_KEY in env)');
    program.addCommand(getTransactionsCommand());
    program.addCommand(getTransactionCommand());
    program.addCommand(updateTransactionCommand());
    program.addCommand(getAssetsCommand());
    program.addCommand(getPlaidAccountsCommand());
    program.addCommand(getAccountsCommand());
    program.addCommand(getCategoriesCommand());
    program.addCommand(getTagsCommand());
    program.addCommand(getSplitwiseExpensesCommand());
    program.addCommand(getSplitwiseGroupCommand());
    program.addCommand(splitwiseToLMCommand());
    program.addCommand(lmToSplitwiseCommand());
    program.addCommand(lmGroupToSplitwiseCommand());
    program.addCommand(amazonToLMCommand());
    return program;
};
