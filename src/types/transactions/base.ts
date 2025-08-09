import { LMTag } from '../tags.ts'

export interface LMTransaction {
    /**
     * Unique identifier for the transaction
     */
    id: number
    /**
     * ISO 8601 format (YYYY-MM-DD)
     */
    date: string
    /**
     * Name of payee. If recurring_id is not null, this field will show the payee of associated recurring expense instead of the original transaction payee
     */
    payee?: string
    /**
     * Amount of the transaction in numeric format to 4 decimal places
     */

    amount: string | number
    /**
     * Three-letter lowercase currency code of the transaction in ISO 4217 format
     */
    currency: string
    /**
     * The amount converted to the user's primary currency. If the multicurrency feature is not being used, to_base and amount will be the same.
     */
    to_base: number
    category_id?: number
    category_name?: string
    category_group_id?: number
    category_group_name?: string
    is_income: boolean
    /**
     * Based on the associated category's property, denotes if transaction is excluded from budget
     */
    exclude_from_budget: boolean
    exclude_from_totals: boolean
    /**
     * The date and time of when the transaction was created (in the ISO 8601 extended format).
     */
    created_at: string
    /**
     * The date and time of when the transaction was created (in the ISO 8601 extended format).
     */
    updated_at: string
    status?: 'cleared' | 'uncleared' | 'pending'
    is_pending: boolean
    notes?: string
    /**
     * The transactions original name before any payee name updates. For synced transactions, this is the raw original payee name from your bank.
     */
    original_name?: string
    recurring_id?: number
    recurring_payee?: string
    recurring_description?: string
    recurring_cadence?:
        | 'once a week'
        | 'every 2 weeks'
        | 'twice a month'
        | 'monthly'
        | 'every 2 months'
        | 'every 3 months'
        | 'every 4 months'
        | 'twice a year'
        | 'yearly'
        | null

    recurring_type?: 'cleared' | 'suggested' | 'dismissed' | null
    /**
     * Amount of associated recurring item in numeric format to 4 decimals, or null for non-recurring transactions
     */
    recurring_amount?: string
    recurring_currency?: number
    /**
     * Exists if this is a split transaction. Denotes the transaction ID of the original transaction.
     */
    parent_id?: number
    has_children: boolean
    /**
     * ID of manually managed asset (must not be set if plaid_account_id is set)
     */
    asset_id?: number
    asset_institution_name?: string
    asset_name?: string
    asset_display_name?: string
    asset_status?: 'active' | 'closed'
    /**
     * ID of associated plaid account (must not be set if asset_id is set)
     */
    plaid_account_id?: number
    plaid_account_name?: string
    plaid_acount_mask?: string
    institution_name?: string
    plaid_account_display_name?: string
    plaid_metadata?: string
    source: 'api' | 'csv' | 'manual' | 'merge' | 'plaid' | 'recurring' | 'rule' | 'user'
    /**
     * Display name for payee for transaction based on whether or not it is linked to a recurring item. If linked, returns recurring_payee field. Otherwise, returns the payee field.
     */
    display_name: string
    /**
     * Display notes for transaction based on whether or not it is linked to a recurring item. If linked, returns recurring_notes field. Otherwise, returns the notes field.
     */
    display_notes?: string
    /**
     * Display name for associated account (manual or Plaid). If this is a synced account, returns plaid_account_display_name or asset_display_name.
     */
    account_display_name: string

    tags: LMTag[]
    /**
     * User-defined external ID for transaction. Max 75 characters. External IDs must be unique within the same asset_id.
     */
    external_id?: string
    is_group: boolean
    /**
     * If it's a group, this is the ID of the group
     */
    group_id?: number
    children?: Pick<
        LMTransaction,
        'id' | 'date' | 'amount' | 'payee' | 'notes' | 'asset_id' | 'plaid_account_id'
    >[]
}

export interface LMTransactionSplit {
    payee?: string
    date?: string
    category_id?: number
    notes?: string
    amount: string | number
}
