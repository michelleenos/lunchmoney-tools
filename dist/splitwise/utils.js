const roundToCents = (n) => Math.floor(n * 100) / 100;
/**
 *
 * @param members Array of members with their share percentages - put CREATOR first
 */
export const splitUnevenlyQuery = (members, cost) => {
    let shares = [];
    let total = 0;
    for (let i = 0; i < members.length; i++) {
        let member = members[i];
        let share = roundToCents(cost * (member.percent / 100));
        shares.push([member.id, share]);
        total += share;
    }
    let diff = cost - total;
    if (diff <= 0.03) {
        shares[0][1] += diff;
    }
    let params = shares.reduce((acc, [id, share], i) => {
        ;
        acc[`users__${i}__user_id`] = id;
        acc[`users__${i}__owed_share`] = share.toFixed(2);
        return acc;
    }, { users__0__paid_share: cost.toFixed(2) });
    return { shares: params, userShare: shares[0][1] };
};
