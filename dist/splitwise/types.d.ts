import type { SplitwiseUserShares } from './types-shares.ts';
export interface SplitwiseExpense {
    id: number;
    description: string;
    details: string | null;
    date: string;
    cost: string;
    category: {
        id: number;
        name: string;
    };
    payment: boolean;
    group_id: number | null;
    comments_count: number;
    deleted_at: string | null;
    users: SplitwiseShare[];
    repayments: SplitwiseRepayment[];
    created_by: {
        id: number;
        first_name: string;
    };
}
export interface SplitwiseShare {
    user: SplitwiseUser;
    user_id: number;
    paid_share: string;
    owed_share: string;
    net_balance: string;
}
export interface SplitwiseRepayment {
    from: number;
    to: number;
    amount: string;
}
export interface SplitwiseExpenseCreate {
    cost: string;
    description: string;
    details?: string;
    /**
     * ISO date string (Date.toISOString())
     */
    date?: string;
    category_id?: number;
    /**
     * 0 to create an expense without a group
     */
    group_id: number;
    split_equally: boolean;
}
export interface SplitwiseExpenseCreateEqual extends SplitwiseExpenseCreate {
    split_equally: true;
}
export type SplitwiseExpenseCreateUnequal<N extends number> = SplitwiseExpenseCreate & {
    split_equally: false;
} & SplitwiseUserShares<N>;
export type SplitwiseExpenseCreateResponse = {
    expenses: SplitwiseExpense[];
    errors: {};
};
export interface SplitwiseUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    registration_status?: 'confirmed' | 'dummy' | 'invited';
    picture: {
        small: string;
        medium: string;
        large: string;
    };
    custom_picture: boolean;
}
export interface SplitwiseGetExpensesQuery {
    /**
     * If provided, only expenses in this group will be returned
     */
    group_id?: number;
    /**
     * If provided, only expenses between the current user and this user will be returned.
     * `group_id` will be ignored.
     */
    friend_id?: number;
    dated_after?: string;
    dated_before?: string;
    updated_after?: string;
    updated_before?: string;
    /**
     * @default 20
     */
    limit?: number;
    /**
     * @default 0
     */
    offset?: number;
}
export interface SplitwiseDebt {
    /**
     * Integer User ID
     */
    from: number;
    /**
     * Integer User ID
     */
    to: number;
    amount: string;
    currency_code: string;
}
export interface SplitwiseGroup {
    id: number;
    name: string;
    group_type: 'home' | 'trip' | 'couple' | 'apartment' | 'house' | 'other';
    updated_at: string;
    simplify_by_default: boolean;
    members: (SplitwiseUser & {
        balance: {
            currency_code: string;
            amount: string;
        }[];
    })[];
    original_debts: SplitwiseDebt[];
    simplified_debts: SplitwiseDebt[];
    avatar: {
        original: string | null;
    };
    custom_avatar: boolean;
    cover_photo: {
        xxlarge: string;
        xlarge: string;
    };
    /**
     * A link the user can send to a friend to join the group directly
     */
    invite_link: string;
}
/**
 * 401: Invalid API key or OAuth token
 */
export type SplitwiseErrorString = {
    error: string;
};
export type SplitwiseErrorObject = {
    errors: {
        base: string[];
    };
};
export declare const isSplitwiseErrorString: (data: unknown) => data is SplitwiseErrorString;
export declare const isSplitwiseErrorObject: (data: unknown) => data is SplitwiseErrorObject;
