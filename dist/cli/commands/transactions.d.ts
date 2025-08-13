import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getTransactionsCommand: () => Command<[], {
    start?: string | undefined;
    end?: string | undefined;
    tagId?: number | undefined;
    catId?: number | undefined;
    asset?: number | undefined;
    plaid?: number | undefined;
    showNotes?: true | undefined;
    showExtId?: true | undefined;
    showTags?: true | undefined;
    showCategory: boolean;
    showAccount: boolean;
    showId: boolean;
    search?: string | undefined;
    writeFile?: string | true | undefined;
    reviewed?: boolean | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
export declare const getTransactionCommand: () => Command<[string], {
    showExtId?: true | undefined;
    showTags?: true | undefined;
    showCategory: boolean;
    showAccount: boolean;
    showId: boolean;
    showNotes?: true | undefined;
    writeFile?: string | true | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
