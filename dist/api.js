import { doRequest } from "./utils/request.js";
import { getEnvVarString } from "./utils/env-vars.js";
import { LMError } from "./utils/errors.js";
import { getLogger } from "./cli/cli-utils/logger.js";
import { adjustTags } from "./utils/adjust-tags.js";
export const LM_URL = `https://dev.lunchmoney.app/v1`;
const logger = getLogger();
export class LunchMoneyApi {
    constructor(apiKey) {
        logger.start(`Initializing LunchMoney API`);
        try {
            if (apiKey) {
                this.apiKey = apiKey;
            }
            else {
                this.apiKey = getEnvVarString('LM_API_KEY');
                logger.info('Using Lunch Money API key from environment variable LM_API_KEY');
            }
        }
        catch (e) {
            throw new LMError(`Missing Lunch Money API key. Please set the LM_API_KEY environment variable or pass the key to the LunchMoneyApi constructor.`, 'auth');
        }
    }
    async request(method, endpoint, args = {}) {
        logger.info(`Lunch Money API request: ${method} ${endpoint}`);
        if (args)
            logger.verbose(`Request args: ${JSON.stringify(args, null, 2)}`);
        let res = await doRequest(method, LM_URL, { Authorization: `Bearer ${this.apiKey}` }, endpoint, args);
        let json = (await res.json());
        if (!res.ok || res.status !== 200) {
            if (res.status === 401 && res.statusText === 'Unauthorized') {
                throw new LMError('Invalid API key', 'auth');
            }
            else {
                throw new LMError(`Error fetching Lunch Money API: ${res.status} ${res.statusText} \n ${JSON.stringify(json, null, 2)}`);
            }
        }
        if (typeof json === 'object' && 'error' in json) {
            if (Array.isArray(json.error) && json.error.length > 0) {
                throw new LMError(`Lunch Money API error: ${json.error.join(', ')}`, 'api');
            }
            if (typeof json.error === 'string' && json.error.length > 0) {
                throw new LMError(`Lunch Money API error: ${json.error}`, 'api');
            }
        }
        return json;
    }
    async getTransactions(query = {}) {
        const q = { ...query };
        if (q.start_date && !q.end_date) {
            q.end_date = new Date().toISOString().split('T')[0];
        }
        const res = await this.request('GET', `transactions`, q);
        logger.verbose(`Fetched ${res.transactions.length} transactions from Lunch Money.`);
        return res;
    }
    searchTransactions(transactions, term) {
        const s = term.toLowerCase();
        return transactions.filter((t) => {
            return t.payee?.toLowerCase().includes(s) || t.notes?.toLowerCase().includes(s);
        });
    }
    getTransaction(id) {
        return this.request('GET', `transactions/${id}`);
    }
    async updateTransaction(id, transaction, settings) {
        logger.verbose(`Updating transaction ${id} with data:`, transaction);
        const { addTags, removeTags, appendNotes, prependNotes, ...update } = transaction;
        if (addTags || removeTags || appendNotes || prependNotes) {
            logger.verbose(`Need to fetch existing transaction data before updating tags or notes`);
            const tr = await this.getTransaction(id);
            if (addTags || removeTags) {
                update.tags = adjustTags(tr.tags, { add: addTags, remove: removeTags });
            }
            if (appendNotes || prependNotes) {
                let hasNotes = tr.notes && tr.notes.length > 0;
                let newNotes = tr.notes || '';
                if (prependNotes) {
                    newNotes = `${prependNotes}${hasNotes ? ' ' : ''}${newNotes || ''}`;
                    hasNotes = true;
                }
                if (appendNotes) {
                    newNotes = `${newNotes || ''}${hasNotes ? ' ' : ''}${appendNotes}`;
                }
                update.notes = newNotes;
            }
        }
        return this.request('PUT', `transactions/${id}`, {
            transaction: update,
            ...settings,
        });
    }
    async unsplitTransactions(parentIds, removeParents = false) {
        return this.request('POST', 'transactions/unsplit', {
            parent_ids: parentIds,
            remove_parents: removeParents,
        });
    }
    async getTransactionGroup(id) {
        return this.request('GET', `transactions/group/${id}`);
    }
    async deleteTransactionGroup(id) {
        return this.request('DELETE', `transactions/group/${id}`);
    }
    async createTransactions(transactions, settings) {
        logger.verbose(`Attempting to create ${transactions.length} LunchMoney transactions`);
        let res = await this.request('POST', `transactions`, {
            transactions,
            ...settings,
        });
        let createdCount = res.ids.length;
        if (createdCount !== transactions.length) {
            logger.warn(`Attempted to create ${transactions.length} transactions, but only ${createdCount} were created. There may have been duplicates.`);
        }
        logger.verbose(`Created ${res.ids.length} transactions`);
        return res;
    }
    getAssets() {
        return this.request('GET', `assets`);
    }
    getPlaidAccounts() {
        return this.request('GET', `plaid_accounts`);
    }
    getCategories(format = 'flattened') {
        return this.request('GET', `categories`, { format });
    }
    createTransactionGroup(data) {
        return this.request('POST', 'transactions/group', data);
    }
    getCurrentUser() {
        return this.request('GET', 'me');
    }
    async getTags({ archived = true } = {}) {
        let res = await this.request('GET', 'tags');
        if (!archived) {
            res = res.filter((t) => !t.archived);
        }
        return res;
    }
}
