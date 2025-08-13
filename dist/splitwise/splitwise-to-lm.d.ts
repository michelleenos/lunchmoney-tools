import type { LMInsertTransactionsSettings } from '../types/index.ts';
interface SplitwiseToLMOpts {
    startDate?: string;
    endDate?: string;
    assetId?: number;
    tag?: string | string[];
    filterSelf?: boolean;
    filterPayment?: boolean;
    dryRun?: boolean;
    lmApiKey?: string;
    swApiKey?: string;
    swGroupId?: number;
    lmSwAssetId?: number;
    /**
     * The script will check for existing transactions in Lunch Money that have an `external_id` matching the Splitwise expense ID.
     * With 'update', if a match is found, the script will check to ensure the amount and date still match data from Splitwise, and update the transaction if not.
     * If `handleDupes` is 'skip', it will simply skip existing transactions and not attempt to create or update them.
     * Note this is different from the `skip_duplicates` option in LMInsertTransactionsSettings, which toggles deduping behavior on the Lunch Money server side.
     * @default 'update'
     */
    handleDupes?: 'update' | 'skip';
    lmInsertSettings?: LMInsertTransactionsSettings;
}
export declare const splitwiseToLMWithUpdates: ({ startDate, endDate, assetId: assetIdOpt, tag, filterSelf, filterPayment, dryRun, lmApiKey, swApiKey, swGroupId, handleDupes, lmInsertSettings: { apply_rules, check_for_recurring, skip_duplicates, skip_balance_update, debit_as_negative, }, }: SplitwiseToLMOpts) => Promise<void>;
export {};
