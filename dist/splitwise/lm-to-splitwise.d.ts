interface LMToSplitwiseOpts {
    lmApiKey?: string;
    swApiKey?: string;
    swGroupId?: number;
    tagId: number;
    removeTag?: boolean;
    addTag?: string;
    excludeTags?: string[];
    startDate?: string;
    endDate?: string;
    dryRun?: boolean;
    unequalShares?: {
        id: number;
        percent: number;
    }[];
}
export declare const lmToSplitwise: ({ lmApiKey, swApiKey, swGroupId, dryRun, tagId, startDate, endDate, removeTag, excludeTags, addTag, unequalShares, }: LMToSplitwiseOpts) => Promise<void>;
interface LMGroupItemToSplitwiseOpts {
    id: number;
    lmApiKey?: string;
    swApiKey?: string;
    swGroupId?: number;
    removeTag?: string;
    addTag?: string;
    unequalShares?: {
        id: number;
        percent: number;
    }[];
}
export declare function lmGroupToSplitwise({ id, lmApiKey, swApiKey, swGroupId, unequalShares, addTag, removeTag, }: LMGroupItemToSplitwiseOpts): Promise<boolean | undefined>;
export {};
