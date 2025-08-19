#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../../api.js";
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { printAccounts } from "../cli-utils/print.js";
import { getLogger } from "../cli-utils/logger.js";
const logger = getLogger();
export const getAssetsCommand = () => {
    const program = new Command();
    return program
        .command('get-assets')
        .description('List all manually managed assets')
        .action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey } = command.optsWithGlobals();
        if (verbose)
            logger.level = Infinity;
        const lm = new LunchMoneyApi(apiKey);
        const res = await lm.getAssets();
        printAccounts(res.assets);
    }));
};
export const getPlaidAccountsCommand = () => {
    const program = new Command();
    return program
        .command('get-plaid')
        .description('List all Plaid-linked accounts')
        .action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey } = command.optsWithGlobals();
        if (verbose)
            logger.level = Infinity;
        const lm = new LunchMoneyApi(apiKey);
        const res = await lm.getPlaidAccounts();
        printAccounts(res.plaid_accounts);
    }));
};
export const getAccountsCommand = () => {
    const program = new Command();
    return program
        .command('get-accounts')
        .description('List both Plaid accounts and manually managed assets')
        .action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey } = command.optsWithGlobals();
        if (verbose)
            logger.level = Infinity;
        const lm = new LunchMoneyApi(apiKey);
        const plaidRes = await lm.getPlaidAccounts();
        const assetRes = await lm.getAssets();
        printAccounts([...plaidRes.plaid_accounts, ...assetRes.assets]);
    }));
};
