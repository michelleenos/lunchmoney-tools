import { LunchMoneyApi } from '../api.ts';
import { LMTransaction } from '../types/index.ts';
import { SplitwiseExpense } from './types.ts';
interface SplitwiseToLMOpts {
    start?: string;
    end?: string;
    assetId: number;
    tag?: string | string[];
    filterSelf?: boolean;
    filterPayment?: boolean;
    dryRun?: boolean;
}
export declare const splitwiseToLM: ({ start, end, assetId, tag, filterSelf, filterPayment, dryRun, }: SplitwiseToLMOpts) => Promise<import("../types/index.ts").LMInsertTransactionsResponse | undefined>;
export declare const splitwiseToLMWithUpdates: ({ start, end, assetId, tag, filterSelf, filterPayment, dryRun, }: SplitwiseToLMOpts) => Promise<void>;
export declare const splitwiseToLMItem: (lm: LunchMoneyApi, exp: SplitwiseExpense & {
    userPayment: string;
}, trs: LMTransaction[], dryRun?: boolean) => Promise<void>;
export declare const updateLMItemToMatchSW: (lm: LunchMoneyApi, exp: SplitwiseExpense & {
    userPayment: string;
}, tr: LMTransaction, dryRun?: boolean) => Promise<void>;
export {};
