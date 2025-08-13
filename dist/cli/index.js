#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { getTransactionsCommand } from "./commands/transactions.js";
import { getAccountsCommand, getAssetsCommand, getPlaidAccountsCommand, } from "./commands/accounts.js";
import { getSplitwiseExpensesCommand, splitwiseToLMCommand } from "./commands/splitwise.js";
import { splitwiseMatchLMCommand } from "./commands/sw-match.js";
import { getCategoriesCommand } from "./commands/categories.js";
const createProgram = () => {
    const program = new Command()
        .option('-v, --verbose', 'Enable verbose logging')
        .option('--api-key <key>', 'Lunch Money API key (if not set will look for LM_API_KEY in env)');
    return program;
};
const program = createProgram();
program.addCommand(getTransactionsCommand());
program.addCommand(getAssetsCommand());
program.addCommand(getPlaidAccountsCommand());
program.addCommand(getAccountsCommand());
program.addCommand(getSplitwiseExpensesCommand());
program.addCommand(splitwiseToLMCommand());
program.addCommand(splitwiseMatchLMCommand());
program.addCommand(getCategoriesCommand());
program.parse();
