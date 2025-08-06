import { doRequest } from './utils/request'
import { getEnvVarString } from './utils/env-vars'
import { LunchMoneyErrorResponse } from './types/errors'
import { LMAsset, LMPlaidAccount } from './types/assets-and-accounts'
import { LMCategory } from './types/categories'
import { LMUser } from './types/user'
import { LMTransaction } from './types/transactions/transactions'
import {
    LMInsertTransactionObject,
    LMInsertTransactionsBody,
    LMInsertTransactionsResponse,
} from './types/transactions/insert'
import {
    LMUpdateTransactionBody,
    LMUpdateTransactionObject,
    LMUpdateTransactionResponse,
} from './types/transactions/update'
import {
    LMTransactionGroupCreate,
    LMTransactionGroupCreateResponse,
} from './types/transactions/groups'
import { LMTransactionsQuery } from './types/transactions/query'

export const LM_URL = `https://api.lunchmoney.app/v1`

export class LunchMoneyApi {
    apiKey: string

    constructor(test = false) {
        this.apiKey = getEnvVarString(test ? 'LM_TEST_KEY' : 'LM_API_KEY')
    }

    request = async <T extends object | number = { [key: string]: any }>(
        method: 'GET' | 'POST' | 'PUT',
        endpoint: string,
        args: { [key: string]: any } = {}
    ) => {
        let res = await doRequest(
            method,
            LM_URL,
            { Authorization: `Bearer ${this.apiKey}` },
            endpoint,
            args
        )

        let json = (await res.json()) as T | LunchMoneyErrorResponse

        if (!res.ok || res.status !== 200) {
            throw new Error(
                `Error fetching Lunch Money API: ${res.status} ${
                    res.statusText
                } \n ${JSON.stringify(json, null, 2)}`
            )
        }

        if (typeof json === 'object' && 'error' in json) {
            if (Array.isArray(json.error) && json.error.length > 0) {
                throw new Error(`Lunch Money API error: ${json.error.join(', ')}`)
            }
            if (typeof json.error === 'string' && json.error.length > 0) {
                throw new Error(`Lunch Money API error: ${json.error}`)
            }
        }

        return json as T
    }

    getTransactions = async (query: LMTransactionsQuery = {}) => {
        return this.request<{ transactions: LMTransaction[]; has_more?: boolean }>(
            'GET',
            `transactions`,
            query
        )
    }

    getTransaction = (id: number) => this.request<LMTransaction>('GET', `transactions/${id}`)

    updateTransaction = (
        id: number,
        transaction: LMUpdateTransactionObject,
        settings?: Omit<LMUpdateTransactionBody, 'transaction'>
    ) => {
        return this.request<LMUpdateTransactionResponse>('PUT', `transactions/${id}`, {
            transaction,
            ...settings,
        })
    }

    createTransactions = (
        transactions: LMInsertTransactionObject[],
        settings?: Omit<LMInsertTransactionsBody, 'transactions'>
    ) => {
        return this.request<LMInsertTransactionsResponse>('POST', `transactions`, {
            transactions,
            ...settings,
        })
    }

    getAssets = () => this.request<{ assets: LMAsset[] }>('GET', `assets`)

    getPlaidAccounts = () =>
        this.request<{ plaid_accounts: LMPlaidAccount[] }>('GET', `plaid_accounts`)

    getCategories = (format: 'flattened' | 'nested' = 'flattened') => {
        return this.request<{ categories: LMCategory[] }>('GET', `categories`, { format })
    }

    createTransactionGroup = async (data: LMTransactionGroupCreate) => {
        return this.request<LMTransactionGroupCreateResponse>('POST', 'transactions/group', data)
    }

    getCurrentUser = async () => {
        return this.request<LMUser>('GET', 'me')
    }
}
