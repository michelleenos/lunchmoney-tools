import { Table } from 'console-table-printer';
import { colors } from "../utils/ansi-colors.js";
const fieldsOptions = ['id', 'date', 'payee', 'amount', 'tags', 'category', 'account'];
export const printTransactions = (transactions, options = ['id', 'date', 'payee', 'amount', 'category', 'account']) => {
    const p = new Table({
        colorMap: {
            // custom: `\x1b[38;5;${colors.mistyRose1}m`,
            gray: `\x1b[38;5;${colors['Grey7'].code}m`,
        },
    });
    const id = options.includes('id');
    const date = options.includes('date');
    const payee = options.includes('payee');
    const amount = options.includes('amount');
    const tags = options.includes('tags');
    const category = options.includes('category');
    const account = options.includes('account');
    if (id)
        p.addColumn({ name: 'id' });
    if (date)
        p.addColumn({ name: 'date' });
    if (payee)
        p.addColumn({ name: 'payee', alignment: 'left', maxLen: 40 });
    if (amount)
        p.addColumn({ name: 'amount', alignment: 'right' });
    if (tags)
        p.addColumn({ name: 'tags', alignment: 'left' });
    if (category)
        p.addColumn({ name: 'category', alignment: 'left' });
    if (account)
        p.addColumn({ name: 'account', alignment: 'left' });
    transactions.forEach((t) => {
        let amt = Number(t.amount);
        let exclude = t.exclude_from_totals;
        let color;
        if (exclude) {
            color = 'gray';
        }
        else if (amt < 0) {
            color = 'green';
        }
        const row = {};
        if (id)
            row.id = t.id;
        if (date)
            row.date = t.date;
        if (payee) {
            row.payee = t.payee && t.payee.length > 40 ? t.payee.slice(0, 37) + '...' : t.payee;
            if (t.recurring_payee) {
                row.payee = `🔄 ${row.payee}`;
            }
        }
        if (amount)
            row.amount = amt.toFixed(2);
        if (tags)
            row.tags = t.tags.map((tag) => tag.name).join(', ');
        if (category)
            row.category = t.category_name;
        if (account) {
            let asset = t.asset_display_name || t.asset_name;
            let plaid = t.plaid_account_display_name || t.plaid_account_name;
            row.account = asset || plaid;
        }
        p.addRow({
            ...row,
        }, {
            // color: Number(t.amount) < 0 ? 'green' : undefined,
            color,
        });
    });
    p.printTable();
};
