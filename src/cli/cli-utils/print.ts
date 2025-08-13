import { LMAsset, LMPlaidAccount, LMTransaction } from '../../types/index.ts'
import { printTable, Table } from 'console-table-printer'
import { colors } from './ansi-colors.ts'
import { display, money } from './write-stuff.ts'

// const fieldsOptions = ['id', 'date', 'payee', 'amount', 'tags', 'category', 'account', 'external_id'] as const

type PrintTransactionShow = {
    id?: boolean
    date?: boolean
    payee?: boolean
    amount?: boolean
    tags?: boolean
    category?: boolean
    account?: boolean
    notes?: boolean
    externalId?: boolean
}

export const printTransactions = (
    transactions: LMTransaction[],
    {
        id = true,
        date = true,
        payee = true,
        amount = true,
        tags = false,
        category = true,
        account = true,
        notes = false,
        externalId = false,
    }: PrintTransactionShow = {}
) => {
    const p = new Table({
        colorMap: {
            // custom: `\x1b[38;5;${colors.mistyRose1}m`,
            gray: `\x1b[38;5;${colors['Grey7'].code}m`,
        },
    })

    if (id) p.addColumn({ name: 'id' })
    if (date) p.addColumn({ name: 'date' })
    if (payee) p.addColumn({ name: 'payee', alignment: 'left', maxLen: 40 })
    if (amount) p.addColumn({ name: 'amount', alignment: 'right' })
    if (tags) p.addColumn({ name: 'tags', alignment: 'left' })
    if (category) p.addColumn({ name: 'category', alignment: 'left' })
    if (account) p.addColumn({ name: 'account', alignment: 'left' })
    if (notes) p.addColumn({ name: 'notes', alignment: 'left' })
    if (externalId) p.addColumn({ name: 'external_id', alignment: 'left' })

    transactions.forEach((t) => {
        let amt = Number(t.amount)
        let exclude = t.exclude_from_totals
        let color = exclude ? 'gray' : amt < 0 ? 'green' : undefined

        const row: { [key: string]: string | number | undefined } = {}
        if (id) row.id = t.id
        if (date) row.date = t.date
        if (payee) {
            row.payee = display(t.payee || 'Unknown')
            if (t.recurring_payee) {
                row.payee = `🔄 ${row.payee}`
            }
        }
        if (amount) row.amount = money(t.amount)
        if (tags) row.tags = t.tags.map((tag) => tag.name).join(', ')
        if (category) row.category = t.category_name
        if (account) {
            let asset = t.asset_display_name || t.asset_name
            let plaid = t.plaid_account_display_name || t.plaid_account_name
            row.account = display(asset || plaid, 20)
        }

        row.notes = display(t.display_notes, 40)

        if (externalId) row.external_id = t.external_id || ''

        p.addRow(row, { color })
    })

    p.printTable()
}

export const printAccounts = (accounts: (LMAsset | LMPlaidAccount)[]) => {
    printTable(
        accounts.map((a) => {
            return {
                id: a.id,
                name: display(a.display_name || a.name),
                balance: money(a.balance),
                institution: a.institution_name,
            }
        }),
        {
            enabledColumns: ['id', 'name', 'balance', 'institution'],
            columns: [{ name: 'id' }, { name: 'name', maxLen: 40 }],
        }
    )
}
