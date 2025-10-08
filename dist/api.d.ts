import { LMAsset, LMPlaidAccount } from './types/assets-and-accounts.ts';
import { LMCategory } from './types/categories.ts';
import { LMUser } from './types/user.ts';
import { LMTransaction } from './types/transactions/base.ts';
import { LMInsertTransactionObject, LMInsertTransactionsBody, LMInsertTransactionsResponse } from './types/transactions/insert.ts';
import { LMUpdateTransactionBody, LMUpdateTransactionExtra, LMUpdateTransactionResponse } from './types/transactions/update.ts';
import { LMTransactionGroupCreate } from './types/transactions/groups.ts';
import { LMTransactionsQuery } from './types/transactions/query.ts';
import { LMTag } from './types/tags.ts';
export declare const LM_URL = "https://api.lunchmoney.app/v1";
export declare class LunchMoneyApi {
    apiKey: string;
    constructor(apiKey?: string);
    request: <T extends object | number = {
        [key: string]: any;
    }>(method: "GET" | "POST" | "PUT" | "DELETE", endpoint: string, args?: {
        [key: string]: any;
    }) => Promise<T>;
    getTransactions: (query?: LMTransactionsQuery) => Promise<{
        transactions: LMTransaction[];
        has_more?: boolean;
    }>;
    searchTransactions: (transactions: LMTransaction[], term: string) => LMTransaction[];
    getTransaction: (id: number) => Promise<LMTransaction>;
    updateTransaction: (id: number, transaction: LMUpdateTransactionExtra, settings?: Omit<LMUpdateTransactionBody, "transaction">) => Promise<LMUpdateTransactionResponse>;
    unsplitTransactions: (parentIds: number[], removeParents?: boolean) => Promise<number[]>;
    getTransactionGroup: (id: number) => Promise<LMTransaction>;
    deleteTransactionGroup: (id: number) => Promise<{
        transactions: number[];
    }>;
    createTransactions: (transactions: LMInsertTransactionObject[], settings?: Omit<LMInsertTransactionsBody, "transactions">) => Promise<LMInsertTransactionsResponse>;
    getAssets: () => Promise<{
        assets: LMAsset[];
    }>;
    getPlaidAccounts: () => Promise<{
        plaid_accounts: LMPlaidAccount[];
    }>;
    getCategories: (format?: "flattened" | "nested") => Promise<{
        categories: LMCategory[];
    }>;
    createTransactionGroup: (data: LMTransactionGroupCreate) => Promise<number>;
    getCurrentUser: () => Promise<LMUser>;
    getTags: ({ archived }?: {
        archived?: boolean;
    }) => Promise<LMTag[]>;
}
