#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getCategoriesCommand: () => Command<[], {}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
