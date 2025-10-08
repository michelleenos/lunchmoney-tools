import { Table } from 'console-table-printer';
import { LunchMoneyApi } from "../api.js";
import { getLogger } from "../cli/cli-utils/logger.js";
import { SplitwiseApi } from "./splitwise-api.js";
import { display, money } from "../cli/cli-utils/write-stuff.js";
const logger = getLogger();
export const lmToSplitwise = async ({ lmApiKey, swApiKey, swGroupId, dryRun, tagId, startDate, endDate, removeTag = false, excludeTags = ['splitwise-auto-added'], addTag = 'splitwise-auto-added', unequalShares, }) => {
    const lm = new LunchMoneyApi(lmApiKey);
    const sw = await new SplitwiseApi(swApiKey, swGroupId).init();
    const res = await lm.getTransactions({
        tag_id: tagId,
        limit: 1000,
        start_date: startDate,
        end_date: endDate,
        pending: false,
    });
    const unableItems = [];
    const items = [];
    res.transactions.forEach((t) => {
        if (excludeTags && t.tags?.some((tag) => excludeTags.includes(tag.name))) {
            return;
        }
        if (t.parent_id && t.group_id) {
            skipWarning(t, 'both member of group and split expense');
            unableItems.push({ transaction: t, reason: 'groupAndSplit' });
            return;
        }
        if (t.is_group) {
            skipWarning(t, 'group expense');
            unableItems.push({ transaction: t, reason: 'group' });
            return;
        }
        if (t.parent_id) {
            skipWarning(t, 'split expense');
            unableItems.push({ transaction: t, reason: 'split' });
            return;
        }
        if (t.group_id) {
            skipWarning(t, 'member of group expense');
            unableItems.push({ transaction: t, reason: 'groupChild' });
            return;
        }
        items.push(t);
    });
    if (unableItems.length > 0) {
        let t = new Table();
        t.addRows(unableItems.map(({ transaction: tr, reason }) => ({
            id: tr.id,
            payee: display(tr.payee, 40),
            amount: money(tr.amount),
            date: tr.date,
            reason,
        })));
        let output = t.render();
        logger.warn(`lmToSplitwise: Skipping ${unableItems.length} transactions:`);
        console.log(output);
    }
    if (dryRun) {
        if (items.length === 0) {
            logger.info('lmToSplitwise Dry Run: No transactions to import to Splitwise');
            return;
        }
        logger.info(`lmToSplitwise Dry Run: Would add ${items.length} transactions to Splitwise`);
        let t = new Table({
            defaultColumnOptions: {
                maxLen: 5,
            },
        });
        let itemObjects = items.map((tItem) => getSwCreateObject(tItem, sw, unequalShares));
        let first = itemObjects[0];
        Object.keys(first).forEach((key) => {
            if (key.startsWith('users__')) {
                t.addColumn({ name: key, title: `${key.slice(0, 7)} ${key.slice(7)}` });
            }
            else {
                t.addColumn({ name: key, maxLen: key === 'description' ? 40 : undefined });
            }
        });
        itemObjects.forEach((tItem) => t.addRow(tItem));
        t.printTable();
        return;
    }
    let importedLen = 0;
    let updatedLen = 0;
    for (const t of items) {
        const { imported, lmUpdated } = await lmToSplitwiseItem(t, lm, sw, {
            unequalShares,
            addTag,
            removeTag: removeTag ? tagId : undefined,
        });
        if (imported)
            importedLen++;
        if (lmUpdated)
            updatedLen++;
    }
    logger.info(`lmToSplitwise: Imported ${importedLen} transactions to Splitwise`);
    if (importedLen < items.length) {
        let diff = items.length - importedLen;
        logger.warn(`lmToSplitwise: ${diff} transactions were not imported to Splitwise`);
    }
    if (updatedLen < importedLen) {
        let diff = importedLen - updatedLen;
        logger.warn(`lmToSplitwise: ${diff} transactions were imported to Splitwise but not updated in Lunch Money`);
    }
};
const skipWarning = (t, reason) => {
    logger.warn(`Skipping transaction ${t.payee || 'unknown'} (${t.id}) - ${reason}.`);
};
const lmToSplitwiseItem = async (t, lm, sw, { unequalShares, addTag = 'splitwise-auto-added', removeTag }) => {
    const createObject = getSwCreateObject(t, sw, unequalShares);
    const amt = createObject.cost;
    const tName = createObject.description;
    const curNotes = t.notes || '';
    let res = await sw.createGroupExpense(createObject);
    if (!res.expenses || res.expenses.length === 0) {
        logger.error(`lmToSplitwiseItem: Failed to import transaction ${tName} (${t.id}) to Splitwise`);
        return { imported: false, lmUpdated: false };
    }
    else {
        logger.info(`lmToSplitwiseItem: Imported transaction ${tName} (${t.id}) - ID: ${res.expenses[0].id}`);
    }
    let user = res.expenses[0].users.find((u) => u.user_id === sw.userId);
    let userShare = user ? user.owed_share : null;
    if (!userShare) {
        logger.error(`lmToSplitwiseItem: Can't determine user share for transaction ${tName} (${t.id})`);
        return { imported: true, lmUpdated: false };
    }
    let newTags = t.tags?.filter((tag) => tag.id !== removeTag).map((tag) => tag.name) || [];
    if (addTag && !newTags.includes(addTag)) {
        newTags.push(addTag);
    }
    const updateRes = await lm.updateTransaction(t.id, {
        tags: newTags,
        amount: userShare,
        notes: `${amt}-SPLIT${curNotes ? ` | ${curNotes}` : ''}`,
    });
    if (updateRes && 'updated' in updateRes) {
        logger.info(`lmToSplitwiseItem: Updated Lunch Money transaction ${tName} (ID: ${t.id}) with new amount ${userShare}`);
        return { imported: true, lmUpdated: true };
    }
    logger.error(`lmToSplitwiseItem: Failed to update Lunch Money transaction ${tName} (ID: ${t.id})`);
    return { imported: true, lmUpdated: false };
};
const getSwCreateObject = (t, sw, unequalShares) => {
    const amt = typeof t.amount === 'string' ? parseFloat(t.amount) : t.amount;
    const tName = t.payee || `Transaction ${t.id}`;
    const createObjectInit = { description: tName, date: t.date, cost: amt.toFixed(2) };
    let createObject = unequalShares
        ? sw.getExpenseCreateObject(createObjectInit, unequalShares)
        : sw.getExpenseCreateObject(createObjectInit);
    return createObject;
};
