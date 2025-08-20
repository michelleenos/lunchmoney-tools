// Utility type to generate a union of numbers from 0 to N-1
type Range<N extends number, Counter extends any[] = []> = Counter['length'] extends N
    ? Counter[number]
    : Range<N, [...Counter, Counter['length']]>

// Type that creates an object with all user share properties from 0 through X-1
export type SplitwiseUserShares<X extends number> = {
    [K in Range<X> as `users__${K}__paid_share`]?: string
} & {
    [K in Range<X> as `users__${K}__owed_share`]: string
} & {
    [K in Range<X> as `users__${K}__user_id`]: number
}
