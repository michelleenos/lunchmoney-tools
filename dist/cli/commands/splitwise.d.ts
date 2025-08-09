import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getSplitwiseExpensesCommand: () => Command<[], {
    start?: string | undefined;
    end?: string | undefined;
    group: boolean;
    filterSelf: boolean;
    filterPayment: boolean;
}, {
    verbose?: true | undefined;
}>;
export declare const splitwiseToLMCommand: () => Command<[], {
    assetId?: number | undefined;
    start?: string | undefined;
    end?: string | undefined;
    filterSelf: boolean;
    tag: string[];
    dryRun?: true | undefined;
}, {
    verbose?: true | undefined;
}>;
