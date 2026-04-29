import { LMTransaction } from 'lunchmoney-tools';
export interface SearchLMTransactionsOpts {
    date: string;
    amount: string;
    name?: string;
    /**
     * @default 7
     */
    dateTolerance?: number;
}
export declare const searchTransactions: (transactions: LMTransaction[], { date, amount, name, dateTolerance }: SearchLMTransactionsOpts) => LMTransaction[];
