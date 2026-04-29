import { LMTransaction } from 'lunchmoney-tools'

export interface SearchLMTransactionsOpts {
    date: string
    amount: string
    name?: string
    /**
     * @default 7
     */
    dateTolerance?: number
}

export const searchTransactions = (
    transactions: LMTransaction[],
    { date, amount, name, dateTolerance = 7 }: SearchLMTransactionsOpts,
) => {
    const searchDate = new Date(date)
    const amountNum = parseFloat(amount)
    const lowerName = name?.toLowerCase()

    const searchResults: LMTransaction[] = []
    transactions.forEach((transaction) => {
        let payee = transaction.payee?.toLowerCase() || ''
        if (lowerName && !payee.includes(lowerName)) return
        let amount =
            typeof transaction.amount === 'string'
                ? parseFloat(transaction.amount)
                : transaction.amount
        if (amount !== amountNum) return

        const tDate = new Date(transaction.date)
        const diffTime = Math.abs(tDate.getTime() - searchDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays > dateTolerance) return

        searchResults.push(transaction)
    })

    return searchResults
}
