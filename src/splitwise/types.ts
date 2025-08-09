export interface SplitwiseExpense {
    id: number
    description: string
    details: string | null
    date: string
    cost: string
    category: {
        id: number
        name: string
    }
    payment: boolean
    group_id: number | null
    comments_count: number
    deleted_at: string | null
    users: SplitwiseShare[]
    repayments: SplitwiseRepayment[]
    created_by: {
        id: number
        first_name: string
    }
}

export interface SplitwiseShare {
    user: SplitwiseUser
    user_id: number
    paid_share: string
    owed_share: string
    net_balance: string
}

export interface SplitwiseRepayment {
    from: number
    to: number
    amount: string
}

// https://dev.splitwise.com/#tag/expenses/paths/~1create_expense/post
export interface SplitwiseExpenseCreate {
    cost: string
    description: string
    details?: string
    /**
     * ISO date string (Date.toISOString())
     */
    date?: string
    category_id?: number
    /**
     * 0 to create an expense without a group
     */
    group_id: number
    split_equally: boolean
}

export type SplitwiseExpenseCreateResponse = {
    expenses: SplitwiseExpense[]
    errors: {}
}

export interface SplitwiseUser {
    id: number
    first_name: string
    last_name: string
    email: string
    registration_status?: 'confirmed' | 'dummy' | 'invited'
    picture: {
        small: string
        medium: string
        large: string
    }
    custom_picture: boolean
}

export interface SplitwiseGetExpensesQuery {
    /**
     * If provided, only expenses in this group will be returned
     */
    group_id?: number
    /**
     * If provided, only expenses between the current user and this user will be returned.
     * `group_id` will be ignored.
     */
    friend_id?: number
    dated_after?: string
    dated_before?: string
    updated_after?: string
    updated_before?: string
    /**
     * @default 20
     */
    limit?: number
    /**
     * @default 0
     */
    offset?: number
}

/**
 * 401: Invalid API key or OAuth token
 */
export type SplitwiseErrorString = {
    error: string
}

export type SplitwiseErrorObject = {
    errors: {
        base: string[]
    }
}

export const isSplitwiseErrorString = (data: unknown): data is SplitwiseErrorString => {
    if (!data || typeof data !== 'object') return false
    if (!('error' in data)) return false
    return typeof (data as SplitwiseErrorString).error === 'string'
}

export const isSplitwiseErrorObject = (data: unknown): data is SplitwiseErrorObject => {
    if (!data || typeof data !== 'object') return false
    if (!('errors' in data)) return false
    if (!('base' in (data as SplitwiseErrorObject).errors)) return false
    if (!Array.isArray((data as SplitwiseErrorObject).errors.base)) return false
    return true
}

// export interface SplitwiseGroupExpenseEvenCreate extends SplitwiseGroupExpenseCreateBase {
//     split_equally: true
// }

// export interface SplitwiseShares3Users
//     extends SplitwiseUserShareData<0>,
//         SplitwiseUserShareData<1>,
//         SplitwiseUserShareData<2> {}

// // export interface MySplitwiseGroupExpenseCreate
// //     extends SplitwiseShares3Users,
// //         SplitwiseGroupExpenseCreate {}

// export interface SplitwiseGroupExpenseUnevenCreate
//     extends SplitwiseGroupExpenseCreateBase,
//         SplitwiseShares3Users {
//     split_equally: false
// }

// export type SplitwiseGroupExpenseCreate =
//     | SplitwiseGroupExpenseEvenCreate
//     | SplitwiseGroupExpenseUnevenCreate
