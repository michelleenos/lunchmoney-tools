export const isSplitwiseErrorString = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    if (!('error' in data))
        return false;
    return typeof data.error === 'string';
};
export const isSplitwiseErrorObject = (data) => {
    if (!data || typeof data !== 'object')
        return false;
    if (!('errors' in data))
        return false;
    if (!('base' in data.errors))
        return false;
    if (!Array.isArray(data.errors.base))
        return false;
    return true;
};
// export interface SplitwiseGroupExpenseEvenCreate extends SplitwiseGroupExpenseCreateBase {
//     split_equally: true
// }
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
