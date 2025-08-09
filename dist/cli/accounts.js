#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../api.js";
import { programWrapper } from "./cli-utils/program-wrapper.js";
import { printAccounts } from "./cli-utils/print.js";
export const getAssetsCommand = () => {
    const program = new Command();
    return program.command('get-assets').action(programWrapper(async () => {
        const lm = new LunchMoneyApi();
        const res = await lm.getAssets();
        printAccounts(res.assets);
    }));
};
export const getPlaidAccountsCommand = () => {
    const program = new Command();
    return program.command('get-plaid').action(programWrapper(async () => {
        const lm = new LunchMoneyApi();
        const res = await lm.getPlaidAccounts();
        printAccounts(res.plaid_accounts);
    }));
};
export const getAccountsCommand = () => {
    const program = new Command();
    return program.command('get-accounts').action(programWrapper(async () => {
        const lm = new LunchMoneyApi();
        const plaidRes = await lm.getPlaidAccounts();
        const assetRes = await lm.getAssets();
        printAccounts([...plaidRes.plaid_accounts, ...assetRes.assets]);
    }));
};
