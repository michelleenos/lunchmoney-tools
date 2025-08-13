import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getSplitwiseExpensesCommand: () => Command<[], {
    startDate?: string | undefined;
    endDate?: string | undefined;
    filterSelf: boolean;
    filterPayment: boolean;
    group?: number | false | undefined;
    swApiKey?: string | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
export declare const splitwiseToLMCommand: () => Command<[], {
    assetId?: number | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    tag: string[];
    handleDupes: string;
    filterSelf: boolean;
    group?: number | undefined;
    swApiKey?: string | undefined;
    dryRun?: true | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
