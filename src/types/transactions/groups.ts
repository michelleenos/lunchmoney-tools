export interface LMTransactionGroupCreate {
    date: string
    payee: string
    category_id?: number
    notes?: string
    /**
     * Array of tag IDs
     */
    tags?: number[]
    /**
     * Array of transaction IDs
     */
    transactions: number[]
}

export type LMTransactionGroupCreateResponse = number
