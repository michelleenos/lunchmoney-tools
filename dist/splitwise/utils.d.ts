import { SplitwiseUserShares } from './types-shares.ts';
/**
 *
 * @param members Array of members with their share percentages - put CREATOR first
 */
export declare const splitUnevenlyQuery: <T extends readonly {
    id: number;
    percent: number;
}[]>(members: T, cost: number) => {
    shares: SplitwiseUserShares<T["length"]>;
    userShare: number;
};
