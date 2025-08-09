import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
export declare const getTransactionsCommand: () => Command<[], {
    start?: string | undefined;
    end?: string | undefined;
    tag?: number | undefined;
    category?: number | undefined;
    asset?: number | undefined;
    plaid?: number | undefined;
    show?: string[] | undefined;
    reviewed?: boolean | undefined;
}, {}>;
