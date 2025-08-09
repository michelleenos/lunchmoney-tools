#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../api.js";
import { LMError } from "../utils/errors.js";
import { printTable } from 'console-table-printer';
export const getAssetsCommand = () => {
    const program = new Command();
    return program.command('get-assets').action(async () => {
        try {
            const lm = new LunchMoneyApi();
            const res = await lm.getAssets();
            printTable(res.assets, {
                enabledColumns: ['name', 'balance', 'institution_name', 'type_name', 'id'],
            });
        }
        catch (e) {
            if (e instanceof LMError) {
                e.displayError();
            }
        }
    });
};
export const getPlaidAccountsCommand = () => {
    const program = new Command();
    return program.command('get-plaid').action(async () => {
        try {
            const lm = new LunchMoneyApi();
            const res = await lm.getPlaidAccounts();
            printTable(res.plaid_accounts, {
                enabledColumns: ['name', 'balance', 'institution_name', 'type_name', 'id'],
            });
        }
        catch (e) {
            if (e instanceof LMError) {
                e.displayError();
            }
        }
    });
};
