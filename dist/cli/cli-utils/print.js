import { printTable, Table } from 'console-table-printer';
import { colors } from "./ansi-colors.js";
import { display, money } from "./write-stuff.js";
export const printTransactions = (transactions, { id = true, date = true, payee = true, amount = true, tags = false, category = true, account = true, notes = false, externalId = false, } = {}) => {
    const p = new Table({
        colorMap: {
            gray: `\x1b[38;5;${colors['Grey7'].code}m`,
        },
    });
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
    if (notes)
        p.addColumn({ name: 'notes', alignment: 'left' });
    if (externalId)
        p.addColumn({ name: 'external_id', alignment: 'left' });
    transactions.forEach((t) => {
        let amt = Number(t.amount);
        let exclude = t.exclude_from_totals;
        let color = exclude ? 'gray' : amt < 0 ? 'green' : undefined;
        const row = {};
        if (id)
            row.id = t.id;
        if (date)
            row.date = t.date;
        if (payee) {
            row.payee = display(t.payee || 'Unknown');
            if (t.recurring_payee) {
                row.payee = `🔄 ${row.payee}`;
            }
        }
        if (amount)
            row.amount = money(t.amount);
        if (tags)
            row.tags = t.tags.map((tag) => tag.name).join(', ');
        if (category)
            row.category = t.category_name;
        if (account) {
            let asset = t.asset_display_name || t.asset_name;
            let plaid = t.plaid_account_display_name || t.plaid_account_name;
            row.account = display(asset || plaid, 20);
        }
        row.notes = display(t.display_notes, 40);
        if (externalId)
            row.external_id = t.external_id || '';
        p.addRow(row, { color });
    });
    p.printTable();
};
export const printAccounts = (accounts) => {
    printTable(accounts.map((a) => {
        return {
            id: a.id,
            name: display(a.display_name || a.name),
            balance: money(a.balance),
            institution: a.institution_name,
        };
    }), {
        enabledColumns: ['id', 'name', 'balance', 'institution'],
        columns: [{ name: 'id' }, { name: 'name', maxLen: 40 }],
    });
};
export const printCategories = (cats, { isNested = true, showDescription = true, showId = true } = {}) => {
    let columns = [
        showId && { name: 'id', color: 'white' },
        { name: 'name', alignment: 'left' },
        showDescription && { name: 'description', maxLen: 40 },
    ].filter((c) => c !== false);
    const t = new Table({
        columns,
        enabledColumns: columns.map((c) => c.name),
    });
    cats.forEach((c) => {
        let name = display(c.name, 0);
        if (c.is_income)
            name += ' 💰';
        t.addRow({ id: c.id, name, description: display(c.description, 0) }, { color: isNested ? 'green' : 'white' });
        if (c.children && isNested) {
            let count = c.children.length;
            c.children.forEach((child, i) => {
                t.addRow({
                    id: child.id,
                    name: `   ${child.name}`,
                    description: display(child.description, 0),
                }, { separator: i === count - 1 ? true : false });
            });
        }
    });
    t.printTable();
};
export const printTags = (tags, { showId = true, showDescription = true, sort = false, showArchived = true } = {}) => {
    let columns = [
        showId && { name: 'id' },
        { name: 'name', alignment: 'left' },
        showDescription && { name: 'description', maxLen: 60 },
        showArchived && { name: 'archived', alignment: 'right' },
    ].filter((c) => c !== false);
    const t = new Table({
        columns,
        enabledColumns: columns.map((c) => c.name),
        sort: sort ? (a, b) => a.name.localeCompare(b.name) : undefined,
    });
    tags.forEach((tag) => {
        t.addRow({
            id: tag.id,
            name: display(tag.name, 0),
            description: display(tag.description, 0),
            archived: showArchived ? (tag.archived ? 'yes' : 'no') : undefined,
        });
    });
    t.printTable();
};
