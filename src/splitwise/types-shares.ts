// type SplitwiseUserShareData<N extends number> = {
//     [K in `users__${N}__paid_share` | `users__${N}__owed_share`]: string
// } & {
//     [K in `users__${N}__user_id`]: number
// }

// type SplitwiseGroupShareData = {
//     [K in `users__${number}__paid_share` | `users__${number}__owed_share`]: string
// } & {
//     [K in `users__${number}__user_id`]: number
// }

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

// export interface SplitwiseShares3Users
//     extends SplitwiseUserShareData<0>,
//         SplitwiseUserShareData<1>,
//         SplitwiseUserShareData<2> {}

// // export interface MySplitwiseGroupExpenseCreate
// //     extends SplitwiseShares3Users,
// //         SplitwiseGroupExpenseCreate {}

// export interface SplitwiseGroupExpenseUnevenCreate
//     extends SplitwiseGroupExpenseCreateBase,
//         SplitwiseShares3Users {
//     split_equally: false
// }

// export type SplitwiseGroupExpenseCreate =
//     | SplitwiseGroupExpenseEvenCreate
//     | SplitwiseGroupExpenseUnevenCreate
