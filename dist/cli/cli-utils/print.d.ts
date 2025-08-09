import { LMAsset, LMPlaidAccount, LMTransaction } from '../../types/index.ts';
type PrintTransactionShow = {
    id?: boolean;
    date?: boolean;
    payee?: boolean;
    amount?: boolean;
    tags?: boolean;
    category?: boolean;
    account?: boolean;
    notes?: boolean;
    externalId?: boolean;
};
export declare const printTransactions: (transactions: LMTransaction[], { id, date, payee, amount, tags, category, account, notes, externalId, }?: PrintTransactionShow) => void;
export declare const printAccounts: (accounts: (LMAsset | LMPlaidAccount)[]) => void;
export {};
