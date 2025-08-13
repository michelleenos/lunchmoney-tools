import { Command } from '@commander-js/extra-typings';
export declare const splitwiseMatchLMCommand: () => Command<[], {
    start?: string | undefined;
    end?: string | undefined;
    swGroupId?: number | undefined;
    swApiKey?: string | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
