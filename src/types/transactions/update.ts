import { LMInsertTransactionObject } from './insert'
import { LMTransactionSplit } from './transactions'

export type LMUpdateTransactionObject = Partial<LMInsertTransactionObject> & {
    split?: LMTransactionSplit[]
}

export interface LMUpdateTransactionBody {
    split?: number[]
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
