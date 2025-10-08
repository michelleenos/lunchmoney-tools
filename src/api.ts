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
    LMUpdateTransactionExtra,
    LMUpdateTransactionResponse,
} from './types/transactions/update.ts'
import {
    LMTransactionGroupCreate,
    LMTransactionGroupCreateResponse,
} from './types/transactions/groups.ts'
import { LMTransactionsQuery } from './types/transactions/query.ts'
import { LMError } from './utils/errors.ts'
import { getLogger } from './cli/cli-utils/logger.ts'
import { LMTag } from './types/tags.ts'
import { adjustTags } from './utils/adjust-tags.ts'

export const LM_URL = `https://api.lunchmoney.app/v1`

const logger = getLogger()
export class LunchMoneyApi {
    apiKey: string

    constructor(apiKey?: string) {
        logger.start(`Initializing LunchMoney API`)

        try {
            if (apiKey) {
                this.apiKey = apiKey
            } else {
                this.apiKey = getEnvVarString('LM_API_KEY')
                logger.info('Using Lunch Money API key from environment variable LM_API_KEY')
            }
        } catch (e) {
            throw new LMError(
                `Missing Lunch Money API key. Please set the LM_API_KEY environment variable or pass the key to the LunchMoneyApi constructor.`,
                'auth'
            )
        }
    }

    request = async <T extends object | number = { [key: string]: any }>(
        method: 'GET' | 'POST' | 'PUT',
        endpoint: string,
        args: { [key: string]: any } = {}
    ) => {
        logger.info(`Lunch Money API request: ${method} ${endpoint}`)
        if (args) logger.verbose(`Request args: ${JSON.stringify(args, null, 2)}`)
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
        const q = { ...query }
        if (q.start_date && !q.end_date) {
            q.end_date = new Date().toISOString().split('T')[0]
        }
        const res = await this.request<{ transactions: LMTransaction[]; has_more?: boolean }>(
            'GET',
            `transactions`,
            q
        )
        if (res.has_more) {
            logger.warn(`Important: Response has_more=true. There are more transactions to fetch.`)
        }
        logger.verbose(
            `Fetched ${res.transactions.length} transactions from Lunch Money. has_more is ${res.has_more}`
        )
        return res
    }

    searchTransactions = (transactions: LMTransaction[], term: string) => {
        const s = term.toLowerCase()
        return transactions.filter((t) => {
            return t.payee?.toLowerCase().includes(s) || t.notes?.toLowerCase().includes(s)
        })
    }

    getTransaction = (id: number) => this.request<LMTransaction>('GET', `transactions/${id}`)

    updateTransaction = async (
        id: number,
        transaction: LMUpdateTransactionExtra,
        settings?: Omit<LMUpdateTransactionBody, 'transaction'>
    ) => {
        logger.verbose(`Updating transaction ${id} with data:`, transaction)

        const { addTags, removeTags, appendNotes, prependNotes, ...update } = transaction

        if (addTags || removeTags || appendNotes || prependNotes) {
            logger.verbose(`Need to fetch existing transaction data before updating tags or notes`)
            const tr = await this.getTransaction(id)

            if (addTags || removeTags) {
                update.tags = adjustTags(tr.tags, { add: addTags, remove: removeTags })
            }

            if (appendNotes || prependNotes) {
                let hasNotes = tr.notes && tr.notes.length > 0
                if (prependNotes) {
                    update.notes = `${prependNotes}${hasNotes ? ' ' : ''}${tr.notes || ''}`
                    hasNotes = true
                }
                if (appendNotes) {
                    update.notes = `${update.notes || ''}${hasNotes ? ' ' : ''}${appendNotes}`
                }
            }
        }

        return this.request<LMUpdateTransactionResponse>('PUT', `transactions/${id}`, {
            transaction: update,
            ...settings,
        })
    }

    unsplitTransactions = async (parentIds: number[], removeParents = false) => {
        return this.request<number[]>('POST', 'transactions/unsplit', {
            parent_ids: parentIds,
            remove_parents: removeParents,
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

    getTags = async ({ archived = true }: { archived?: boolean } = {}) => {
        let res = await this.request<LMTag[]>('GET', 'tags')
        if (!archived) {
            res = res.filter((t) => !t.archived)
        }
        return res
    }
}
