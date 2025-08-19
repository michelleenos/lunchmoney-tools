type Range<N extends number, Counter extends any[] = []> = Counter['length'] extends N ? Counter[number] : Range<N, [...Counter, Counter['length']]>;
export type SplitwiseUserShares<X extends number> = {
    [K in Range<X> as `users__${K}__paid_share`]?: string;
} & {
    [K in Range<X> as `users__${K}__owed_share`]: string;
} & {
    [K in Range<X> as `users__${K}__user_id`]: number;
};
export {};
