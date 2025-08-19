import { LMAsset, LMCategory, LMPlaidAccount, LMTag, LMTransaction } from '../../types/index.ts';
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
interface PrintCategoriesOpts {
    isNested?: boolean;
    showDescription?: boolean;
    showId?: boolean;
}
export declare const printCategories: (cats: LMCategory[], { isNested, showDescription, showId }?: PrintCategoriesOpts) => void;
interface PrintTagsOpts {
    showId?: boolean;
    showDescription?: boolean;
    sort?: boolean;
    showArchived?: boolean;
}
export declare const printTags: (tags: LMTag[], { showId, showDescription, sort, showArchived }?: PrintTagsOpts) => void;
export {};
