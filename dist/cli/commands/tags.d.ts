#! /usr/bin/env node
import { Command } from '@commander-js/extra-typings';
export declare const getTagsCommand: () => Command<[], {
    sort?: true | undefined;
    archived: boolean;
    description: boolean;
    id: boolean;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
