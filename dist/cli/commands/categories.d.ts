#! /usr/bin/env node
import { Command } from '@commander-js/extra-typings';
export declare const getCategoriesCommand: () => Command<[], {
    description: boolean;
    id: boolean;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
