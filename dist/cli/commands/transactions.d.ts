import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getTransactionsCommand: () => Command<[], {
    start: string;
    end: string;
    tagId?: number | undefined;
    catId?: number | undefined;
    asset?: number | undefined;
    plaid?: number | undefined;
    showNotes?: true | undefined;
    showExternalId?: true | undefined;
    showTags: boolean;
    showCategory: boolean;
    showAccount: boolean;
    showId: boolean;
    search?: string | undefined;
    writeFile?: string | true | undefined;
    reviewed?: boolean | undefined;
}, {
    verbose?: true | undefined;
}>;
