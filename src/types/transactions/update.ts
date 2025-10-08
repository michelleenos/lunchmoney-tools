import { LMTransactionSplit } from './base.ts'

export type LMUpdateTransactionObject = {
    date?: string
    category_id?: number
    payee?: string
    amount?: number | string
    curency?: string
    asset_id?: number
    plaid_account_id?: number
    recurring_id?: number
    notes?: string
    status?: 'cleared' | 'uncleared'
    /**
     * User-defined external ID for transaction. Max 75 characters. External IDs must be unique within the same asset_id. You may only update this if this transaction was not created from an automatic import, i.e. if this transaction is not associated with a plaid_account_id
     */
    external_id?: string
    tags?: (string | number)[]
}

export interface LMUpdateTransactionBody {
    split?: LMTransactionSplit[]
    transaction?: LMUpdateTransactionObject
    /**
     * If true, will assume negative amount values denote expenses and positive amount values denote credits. Defaults to false.
     * @default false
     */
    debit_as_negative?: boolean
    /**
     * If false, will skip updating balance if an asset_id is present for any of the transactions.
     * @default true
     */
    skip_balance_update?: boolean
}

export interface LMUpdateTransactionResponse {
    updated: true
    split?: number[]
}

export interface LMUpdateTransactionExtra extends LMUpdateTransactionObject {
    /*
     * Tag names or IDs to add to the transaction. If set, `tags` option will be ignored.
     */
    addTags?: (string | number)[]
    /**
     * Tag names or IDs to remove from the transaction. If set, `tags` option will be ignored.
     */
    removeTags?: (number | string)[]
    /**
     * Will fetch existing notes and append this string to them.
     * If set, `notes` option will be ignored.
     */
    appendNotes?: string
    /**
     * Will fetch existing notes and prepend this string to them.
     * If set, `notes` option will be ignored.
     */
    prependNotes?: string
}
