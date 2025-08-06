export interface LMAsset {
    id: number
    type_name: string
    subtype_name?: string
    name: string
    display_name?: string
    /**
     * Current balance in numeric format to 4 decimal places
     */
    balance: string
    to_base?: number
    balance_as_of: string
    /**
     * Date this asset was closed (optional)
     */
    closed_on?: string
    /**
     * 3-letter lowercase currency code of the balance in ISO 4217 format
     */
    currency: string
    institution_name?: string
    exclude_transactions: boolean
    created_at: string
}

export interface LMPlaidAccount {
    id: number
    date_linked: string
    name: string
    display_name: string
    type: string
    subtype?: string
    mask: string
    institution_name: string
    status: string
    balance: string
    to_base?: number
    currency: string
    balance_last_update: string
    limit?: number
    import_start_date?: string
    last_import?: string
    last_fetch?: string
    plaid_last_successful_update: string
}
