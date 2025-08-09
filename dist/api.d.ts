import { LMAsset, LMPlaidAccount } from './types/assets-and-accounts.ts';
import { LMCategory } from './types/categories.ts';
import { LMUser } from './types/user.ts';
import { LMTransaction } from './types/transactions/base.ts';
import { LMInsertTransactionObject, LMInsertTransactionsBody, LMInsertTransactionsResponse } from './types/transactions/insert.ts';
import { LMUpdateTransactionBody, LMUpdateTransactionObject, LMUpdateTransactionResponse } from './types/transactions/update.ts';
import { LMTransactionGroupCreate } from './types/transactions/groups.ts';
import { LMTransactionsQuery } from './types/transactions/query.ts';
export declare const LM_URL = "https://api.lunchmoney.app/v1";
export declare class LunchMoneyApi {
    apiKey: string;
    constructor(test?: boolean);
    request: <T extends object | number = {
        [key: string]: any;
    }>(method: "GET" | "POST" | "PUT", endpoint: string, args?: {
        [key: string]: any;
    }) => Promise<T>;
    getTransactions: (query?: LMTransactionsQuery) => Promise<{
        transactions: LMTransaction[];
        has_more?: boolean;
    }>;
    getTransaction: (id: number) => Promise<LMTransaction>;
    updateTransaction: (id: number, transaction: LMUpdateTransactionObject, settings?: Omit<LMUpdateTransactionBody, "transaction">) => Promise<LMUpdateTransactionResponse>;
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
}
