// import { doRequest } from '../utils/request'
import { doRequest } from '../utils/request.ts'
import {
    isSplitwiseErrorObject,
    isSplitwiseErrorString,
    SplitwiseErrorObject,
    SplitwiseErrorString,
    SplitwiseExpense,
    SplitwiseExpenseCreate,
    SplitwiseExpenseCreateResponse,
    SplitwiseGetExpensesQuery,
    SplitwiseUser,
    SplitwiseGroup,
    SplitwiseExpenseCreateEqual,
    SplitwiseExpenseCreateUnequal,
} from './types.ts'
import { getEnvVarNum, getEnvVarString } from '../utils/env-vars.ts'
import { LMError } from '../utils/errors.ts'
import { getLogger } from '../cli/cli-utils/logger.ts'
import { splitUnevenlyQuery } from './utils.ts'
// import { writeJson } from '../utils/files'

export const SW_URL = 'https://secure.splitwise.com/api/v3.0'

interface GetExpensesOpts {
    /**
     * ISO date string (Date.toISOString())
     */
    dateAfter?: string
    /**
     * ISO date string (Date.toISOString())
     */
    dateBefore?: string
    /**
     * If true, only expenses from the group set in env vars.
     * @default true
     */
    group?: boolean
}

interface FilterExpensesOpts {
    /**
     * Filter payments
     * @default true
     */
    filterPayment?: boolean
    /**
     * Filter expenses created by the current user.
     * @default true
     */
    filterSelf?: boolean
    /**
     * Filter deleted expenses
     * @default true
     */
    filterDeleted?: boolean
}

interface SplitwiseApiNotReady {
    ready: false
}
interface SplitwiseApiReady {
    ready: true
    userId: number
}

function assertReady(state: SplitwiseApiState): asserts state is SplitwiseApiReady {
    if (!state.ready) {
        throw new Error('SplitwiseApi is not initialized. Call init() before making requests.')
    }
}

type SplitwiseApiState = SplitwiseApiNotReady | SplitwiseApiReady

const logger = getLogger()

export class SplitwiseApi {
    groupId: number | null
    apiKey: string
    state: SplitwiseApiState = { ready: false }

    constructor(apiKey?: string, groupId?: number | false) {
        try {
            if (apiKey) {
                this.apiKey = apiKey
            } else {
                this.apiKey = getEnvVarString('SW_API_KEY')
            }
        } catch (e) {
            throw new LMError(
                `Missing Splitwise API key. Please set the SW_API_KEY environment variable.`,
                'auth'
            )
        }

        if (groupId === false) {
            this.groupId = null
        } else if (typeof groupId === 'number') {
            this.groupId = groupId
        } else {
            try {
                this.groupId = getEnvVarNum('SW_GROUP_ID')
            } catch (e) {
                throw new LMError(
                    `Missing Splitwise group ID. Please set the SW_GROUP_ID environment variable.`,
                    'config'
                )
            }
        }
    }

    get userId(): number {
        assertReady(this.state)
        return this.state.userId
    }

    init = async () => {
        let userRes = await this.getCurrentUser()
        let user = userRes.user

        this.state = { ready: true, userId: user.id }
        logger.info(
            `SplitwiseApi: Successfully connected to Splitwise; your user ID is: ${user.id}`
        )

        return this
    }

    request = async <T = { [key: string]: any }>(
        method: 'GET' | 'POST',
        endpoint: string,
        args: { [key: string]: any } = {}
    ) => {
        logger.info(`Splitwise API request: ${method} ${endpoint}`)
        if (args) logger.verbose(`Request args:`, args)
        let res = await doRequest(
            method,
            SW_URL,
            { Authorization: `Bearer ${this.apiKey}` },
            endpoint,
            args
        )

        const json: T | SplitwiseErrorObject | SplitwiseErrorString = await res.json()
        // await writeJson('.data', `${Date.now()}-splitwise-${endpoint}.json`, res)
        if (!res.ok || res.status !== 200) {
            if (isSplitwiseErrorObject(json)) {
                throw new LMError(`Splitwise API error: ${json.errors.base.join(', ')}`, 'api')
            }
            if (isSplitwiseErrorString(json)) {
                throw new LMError(`Splitwise API error: ${json.error}`, 'api')
            }
            throw new LMError(`Error fetching splitwise API: ${res.status} ${res.statusText}`)
        }

        return json as T
    }

    getExpense = (id: number) => {
        return this.request<{ expense: SplitwiseExpense }>('GET', `get_expense/${id}`)
    }

    getExpenses = async ({ dateAfter, dateBefore }: GetExpensesOpts = {}) => {
        const args: SplitwiseGetExpensesQuery = {
            group_id: this.groupId ?? undefined,
            limit: 999,
        }
        if (dateAfter) {
            args.dated_after = dateAfter
        }
        if (dateBefore) {
            args.dated_before = dateBefore
        }

        const res = await this.request<{ expenses: SplitwiseExpense[] }>(
            'GET',
            'get_expenses',
            args
        )

        logger.info(
            `SplitwiseApi.getExpenses: Fetched ${res.expenses.length} expenses from Splitwise`
        )

        return res.expenses
    }

    getFilteredExpenses = async (opts: FilterExpensesOpts & GetExpensesOpts = {}) => {
        const expenses = await this.getExpenses(opts)
        return this.filterExpenses(expenses, opts)
    }

    filterExpenses = (
        expenses: SplitwiseExpense[],
        { filterPayment = true, filterSelf = true, filterDeleted = true }: FilterExpensesOpts = {}
    ) => {
        let initLen = expenses.length

        let res = expenses.filter((expense) => {
            if (filterDeleted && expense.deleted_at) return false
            if (filterPayment && expense.payment) return false
            if (filterSelf && expense.created_by.id === this.userId) return false
            return true
        })

        logger.verbose(
            `SplitwiseApi.filterExpenses: From ${initLen} expenses, filtered to ${res.length} using options:`,
            { filterPayment, filterDeleted, filterSelf }
        )

        return res
    }

    createGroupExpense = (
        args:
            | Omit<SplitwiseExpenseCreateEqual, 'group_id'>
            | Omit<SplitwiseExpenseCreateUnequal<any>, 'group_id'>
    ) => {
        if (!this.groupId) {
            throw new LMError(
                'Sorry, this package does not support creating Splitwise expenses without a group.',
                'config'
            )
        }
        const allArgs: SplitwiseExpenseCreate = {
            ...args,
            group_id: this.groupId,
        }
        return this.request<SplitwiseExpenseCreateResponse>('POST', 'create_expense', allArgs)
    }

    // createGroupExpenseUnequal = <T extends readonly { id: number; percent: number }[]>(
    //     expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>,
    //     members: T
    // ): Promise<SplitwiseExpenseCreateResponse> => {
    //     if (!this.groupId) {
    //         throw new LMError(
    //             'Sorry, this package does not support creating Splitwise expenses without a group.',
    //             'config'
    //         )
    //     }

    //     const shares = splitUnevenlyQuery(members, parseFloat(expense.cost))
    //     const expenseArgs: SplitwiseExpenseCreateUnequal<T['length']> = {
    //         ...expense,
    //         ...shares,
    //         cost: expense.cost,
    //         group_id: this.groupId,
    //         split_equally: false,
    //     }
    //     return this.request<SplitwiseExpenseCreateResponse>('POST', 'create_expense', expenseArgs)
    // }

    getEqualExpenseCreateObject = (
        expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>
    ): SplitwiseExpenseCreateEqual => {
        if (!this.groupId) {
            throw new LMError(
                'Sorry, this package does not support creating Splitwise expenses without a group.',
                'config'
            )
        }

        return {
            ...expense,
            cost: expense.cost,
            group_id: this.groupId,
            split_equally: true,
        }
    }

    getExpenseCreateObject<T extends { id: number; percent: number }[]>(
        expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>,
        members: T
    ): SplitwiseExpenseCreateUnequal<T['length']>
    getExpenseCreateObject(
        expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>
    ): SplitwiseExpenseCreateEqual

    getExpenseCreateObject<T extends { id: number; percent: number }[]>(
        expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>,
        members?: T
    ) {
        if (!this.groupId) {
            throw new LMError(
                'Sorry, this package does not support creating Splitwise expenses without a group.',
                'config'
            )
        }

        if (members && members.length > 0) {
            const { shares, userShare } = splitUnevenlyQuery(members, parseFloat(expense.cost))
            const expenseArgs: SplitwiseExpenseCreateUnequal<T['length']> = {
                ...expense,
                ...shares,
                cost: expense.cost,
                group_id: this.groupId,
                split_equally: false,
            }
            return expenseArgs
        } else {
            const expenseArgs: SplitwiseExpenseCreateEqual = {
                ...expense,
                cost: expense.cost,
                group_id: this.groupId,
                split_equally: true,
            }
            return expenseArgs
        }
    }

    getCurrentUser = async () => {
        return this.request<{ user: SplitwiseUser }>('GET', 'get_current_user')
    }

    getCurrentGroup = async (groupId?: number) => {
        if (!groupId && !this.groupId) {
            throw new LMError(
                'No group ID set. Please set the SW_GROUP_ID environment variable, or pass a group ID to the SplitwiseApi constructor or getCurrentGroup method.',
                'config'
            )
        }
        return this.request<{ group: SplitwiseGroup }>('GET', `get_group/${this.groupId}`)
    }
}
