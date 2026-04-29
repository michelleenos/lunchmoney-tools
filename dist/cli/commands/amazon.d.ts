import { Command } from '@commander-js/extra-typings';
export declare const amazonToLMCommand: () => Command<[string], {
    start?: string | undefined;
    end?: string | undefined;
    addTags: string[] | [string];
    excludeTags: string[] | [string];
    writeFiles?: string | true | undefined;
    dryRun?: true | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
