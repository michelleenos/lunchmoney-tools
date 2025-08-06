export interface LMTransactionsQuery {
    tag_id?: number
    recurring_id?: number
    plaid_account_id?: number
    category_id?: number
    asset_id?: number
    is_group?: boolean
    status?: 'cleared' | 'uncleared'
    /**
     * ISO 8601 format (YYYY-MM-DD)
     * if set, end_date is also required
     */
    start_date?: string
    /**
     * ISO 8601 format (YYYY-MM-DD)
     * if set, start_date is also required
     */
    end_date?: string
    /**
     * @default false
     */
    pending?: boolean
    debit_as_negative?: boolean
    offset?: number
    /**
     * @default 1000
     */
    limit?: number
}
