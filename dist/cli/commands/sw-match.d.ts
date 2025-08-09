import { Command } from '@commander-js/extra-typings';
export declare const splitwiseMatchLMCommand: () => Command<[], {
    start: string;
    end: string;
}, {
    verbose?: true | undefined;
}>;
