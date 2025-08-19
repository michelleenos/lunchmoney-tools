import { LMInsertTransactionObject } from './insert.ts';
import { LMTransactionSplit } from './base.ts';
export type LMUpdateTransactionObject = Partial<LMInsertTransactionObject> & {
    split?: LMTransactionSplit[];
};
export interface LMUpdateTransactionBody {
    split?: number[];
    transaction?: LMUpdateTransactionObject;
    /**
     * If true, will assume negative amount values denote expenses and positive amount values denote credits. Defaults to false.
     * @default false
     */
    debit_as_negative?: boolean;
    /**
     * If false, will skip updating balance if an asset_id is present for any of the transactions.
     * @default true
     */
    skip_balance_update?: boolean;
}
export interface LMUpdateTransactionResponse {
    updated: true;
    split?: number[];
}
export interface LMUpdateTransactionExtra extends LMUpdateTransactionObject {
    addTags?: (string | number)[];
    /**
     * Tag names or IDs to remove from the transaction. If set, `tags` option will be ignored.
     */
    removeTags?: (number | string)[];
    /**
     * Will fetch existing notes and append this string to them.
     * If set, `notes` option will be ignored.
     */
    appendNotes?: string;
    /**
     * Will fetch existing notes and prepend this string to them.
     * If set, `notes` option will be ignored.
     */
    prependNotes?: string;
}
