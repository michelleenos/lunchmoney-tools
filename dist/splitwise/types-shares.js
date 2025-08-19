// type SplitwiseUserShareData<N extends number> = {
//     [K in `users__${N}__paid_share` | `users__${N}__owed_share`]: string
// } & {
//     [K in `users__${N}__user_id`]: number
// }
export {};
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
