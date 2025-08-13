import { SplitwiseExpense, SplitwiseExpenseCreate, SplitwiseExpenseCreateResponse, SplitwiseUser } from './types.ts';
export declare const SW_URL = "https://secure.splitwise.com/api/v3.0";
interface GetExpensesOpts {
    /**
     * ISO date string (Date.toISOString())
     */
    dateAfter?: string;
    /**
     * ISO date string (Date.toISOString())
     */
    dateBefore?: string;
    /**
     * If true, only expenses from the group set in env vars.
     * @default true
     */
    group?: boolean;
}
interface FilterExpensesOpts {
    /**
     * Filter payments
     * @default true
     */
    filterPayment?: boolean;
    /**
     * Filter expenses created by the current user.
     * @default true
     */
    filterSelf?: boolean;
    /**
     * Filter deleted expenses
     * @default true
     */
    filterDeleted?: boolean;
}
interface SplitwiseApiNotReady {
    ready: false;
}
interface SplitwiseApiReady {
    ready: true;
    userId: number;
}
type SplitwiseApiState = SplitwiseApiNotReady | SplitwiseApiReady;
export declare class SplitwiseApi {
    groupId: number | null;
    apiKey: string;
    state: SplitwiseApiState;
    constructor(apiKey?: string, groupId?: number | false);
    get userId(): number;
    init: () => Promise<this>;
    request: <T = {
        [key: string]: any;
    }>(method: "GET" | "POST", endpoint: string, args?: {
        [key: string]: any;
    }) => Promise<T>;
    getExpense: (id: number) => Promise<{
        expense: SplitwiseExpense;
    }>;
    getExpenses: ({ dateAfter, dateBefore }?: GetExpensesOpts) => Promise<SplitwiseExpense[]>;
    getFilteredExpenses: (opts?: FilterExpensesOpts & GetExpensesOpts) => Promise<SplitwiseExpense[]>;
    filterExpenses: (expenses: SplitwiseExpense[], { filterPayment, filterSelf, filterDeleted }?: FilterExpensesOpts) => SplitwiseExpense[];
    createGroupExpense: (args: Omit<SplitwiseExpenseCreate, "group_id" | "split_equally">) => Promise<SplitwiseExpenseCreateResponse>;
    getCurrentUser: () => Promise<{
        user: SplitwiseUser;
    }>;
}
export {};
