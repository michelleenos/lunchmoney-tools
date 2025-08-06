export interface LMInsertTransactionObject {
    /**
     * Must be in ISO 8601 format (YYYY-MM-DD)
     */
    date: string
    amount: string | number
    category_id?: number
    payee?: string
    currency?: string
    /**
     * Unique identifier for associated asset (manually-managed account).
     * Asset must be associated with the same account. When set plaid_account_id may not be set.
     */
    asset_id?: number
    /**
     * Unique identifier for associated plaid account.
     * This must have the "Allow Modifications to Transactions" option set.
     * When set `asset_id` may not be set.
     */
    plaid_account_id?: number
    /**
     * Unique identifier for associated recurring expense. Recurring expense must be associated with the same account.
     */
    recurring_id?: number
    notes?: string
    /**
     * @default 'uncleared'
     */
    status?: 'cleared' | 'uncleared'
    /**
     * User-defined external ID for transaction. Max 75 characters. External IDs must be unique within the same asset_id.
     */
    external_id?: string
    /**
     * Passing in a number will attempt to match by ID. If no matching tag ID is found, an error will be thrown.
     * Passing in a string will attempt to match by string. If no matching tag name is found, a new tag will be created.
     */
    tags?: (number | string)[]
}

export interface LMInsertTransactionsBody {
    transactions: LMInsertTransactionObject[]
    /**
     * If true, will apply account’s existing rules to the inserted transactions. Defaults to false.
     * @default false
     */
    apply_rules?: boolean
    /**
     * If true, the system will automatically dedupe based on transaction date, payee and amount. Note that deduping by external_id will occur regardless of this flag.
     * @default false
     */
    skip_duplicates?: boolean
    /**
     * If true, will check new transactions for occurrences of new monthly expenses. Defaults to false.
     * @default false
     */
    check_for_recurring?: boolean
    /**
     * If true, will assume negative amount values denote expenses and positive amount values denote credits.
     * @default false
     */
    debit_as_negative?: boolean
    /**
     * If true, will skip updating balance if an asset_id is present for any of the transactions.
     * @default true
     */
    skip_balance_update?: boolean
}

export type LMInsertTransactionsResponse = {
    ids: number[]
}
