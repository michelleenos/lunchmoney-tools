import { doRequest } from './utils/request.ts'
import { getEnvVarString } from './utils/env-vars.ts'
import { LunchMoneyErrorResponse } from './types/errors.ts'
import { LMAsset, LMPlaidAccount } from './types/assets-and-accounts.ts'
import { LMCategory } from './types/categories.ts'
import { LMUser } from './types/user.ts'
import { LMTransaction } from './types/transactions/base.ts'
import {
    LMInsertTransactionObject,
    LMInsertTransactionsBody,
    LMInsertTransactionsResponse,
} from './types/transactions/insert.ts'
import {
    LMUpdateTransactionBody,
    LMUpdateTransactionObject,
    LMUpdateTransactionResponse,
} from './types/transactions/update.ts'
import {
    LMTransactionGroupCreate,
    LMTransactionGroupCreateResponse,
} from './types/transactions/groups.ts'
import { LMTransactionsQuery } from './types/transactions/query.ts'
import { LMError } from './utils/errors.ts'
import { getLogger } from './cli/cli-utils/logger.ts'

export const LM_URL = `https://api.lunchmoney.app/v1`

const logger = getLogger()
export class LunchMoneyApi {
    apiKey: string

    constructor(test = false) {
        try {
            this.apiKey = getEnvVarString(test ? 'LM_TEST_KEY' : 'LM_API_KEY')
        } catch (e) {
            throw new LMError(
                `Missing Lunch Money API key. Please set the LM_API_KEY environment variable.`,
                'auth'
            )
        }

        logger.info(`Initializing LunchMoney API`)
    }

    request = async <T extends object | number = { [key: string]: any }>(
        method: 'GET' | 'POST' | 'PUT',
        endpoint: string,
        args: { [key: string]: any } = {}
    ) => {
        logger.info(`Lunch Money API request: ${method} ${endpoint}`)
        let res = await doRequest(
            method,
            LM_URL,
            { Authorization: `Bearer ${this.apiKey}` },
            endpoint,
            args
        )

        let json = (await res.json()) as T | LunchMoneyErrorResponse

        if (!res.ok || res.status !== 200) {
            throw new LMError(
                `Error fetching Lunch Money API: ${res.status} ${
                    res.statusText
                } \n ${JSON.stringify(json, null, 2)}`
            )
        }

        if (typeof json === 'object' && 'error' in json) {
            if (Array.isArray(json.error) && json.error.length > 0) {
                throw new LMError(`Lunch Money API error: ${json.error.join(', ')}`, 'api')
            }
            if (typeof json.error === 'string' && json.error.length > 0) {
                throw new LMError(`Lunch Money API error: ${json.error}`, 'api')
            }
        }

        return json as T
    }

    getTransactions = async (query: LMTransactionsQuery = {}) => {
        const res = await this.request<{ transactions: LMTransaction[]; has_more?: boolean }>(
            'GET',
            `transactions`,
            query
        )
        logger.verbose(
            `Fetched ${res.transactions.length} transactions from Lunch Money. has_more is ${res.has_more}`
        )
        return res
    }

    getTransaction = (id: number) => this.request<LMTransaction>('GET', `transactions/${id}`)

    updateTransaction = (
        id: number,
        transaction: LMUpdateTransactionObject,
        settings?: Omit<LMUpdateTransactionBody, 'transaction'>
    ) => {
        logger.verbose(`Will attempt to update transaction ${id} with data:`, transaction)
        return this.request<LMUpdateTransactionResponse>('PUT', `transactions/${id}`, {
            transaction,
            ...settings,
        })
    }

    createTransactions = async (
        transactions: LMInsertTransactionObject[],
        settings?: Omit<LMInsertTransactionsBody, 'transactions'>
    ) => {
        logger.verbose(`Attempting to create ${transactions.length} LunchMoney transactions`)
        let res = await this.request<LMInsertTransactionsResponse>('POST', `transactions`, {
            transactions,
            ...settings,
        })

        let createdCount = res.ids.length
        if (createdCount !== transactions.length) {
            logger.warn(
                `Attempted to create ${transactions.length} transactions, but only ${createdCount} were created. There may have been duplicates.`
            )
        }
        logger.verbose(`Created ${res.ids.length} transactions`)

        return res
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
