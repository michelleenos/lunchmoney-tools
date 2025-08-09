#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getAssetsCommand: () => Command<[], {}, {
    verbose?: true | undefined;
}>;
export declare const getPlaidAccountsCommand: () => Command<[], {}, {
    verbose?: true | undefined;
}>;
export declare const getAccountsCommand: () => Command<[], {}, {
    verbose?: true | undefined;
}>;
