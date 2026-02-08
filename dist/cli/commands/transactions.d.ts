import { Command } from '@commander-js/extra-typings';
export declare const getTransactionsCommand: () => Command<[], {
    start?: string | undefined;
    end?: string | undefined;
    tagId?: number | undefined;
    catId?: number | undefined;
    asset?: number | undefined;
    plaid?: number | undefined;
    reviewed?: boolean | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    search?: string | undefined;
    showExtId?: true | undefined;
    showTags?: true | undefined;
    showNotes: boolean;
    showCategory: boolean;
    showAccount: boolean;
    showId: boolean;
    writeFile?: string | true | undefined;
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
export declare const updateTransactionCommand: () => Command<[string], {
    amount?: string | undefined;
    notes?: string | undefined;
    payee?: string | undefined;
    tags?: string[] | undefined;
    categoryId?: number | undefined;
    dryRun?: true | undefined;
}, {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}>;
