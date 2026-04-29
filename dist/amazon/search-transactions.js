export const searchTransactions = (transactions, { date, amount, name, dateTolerance = 7 }) => {
    const searchDate = new Date(date);
    const amountNum = parseFloat(amount);
    const lowerName = name?.toLowerCase();
    const searchResults = [];
    transactions.forEach((transaction) => {
        let payee = transaction.payee?.toLowerCase() || '';
        if (lowerName && !payee.includes(lowerName))
            return;
        let amount = typeof transaction.amount === 'string'
            ? parseFloat(transaction.amount)
            : transaction.amount;
        if (amount !== amountNum)
            return;
        const tDate = new Date(transaction.date);
        const diffTime = Math.abs(tDate.getTime() - searchDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > dateTolerance)
            return;
        searchResults.push(transaction);
    });
    return searchResults;
};
