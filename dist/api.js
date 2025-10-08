import { doRequest } from "./utils/request.js";
import { getEnvVarString } from "./utils/env-vars.js";
import { LMError } from "./utils/errors.js";
import { getLogger } from "./cli/cli-utils/logger.js";
import { adjustTags } from "./utils/adjust-tags.js";
export const LM_URL = `https://api.lunchmoney.app/v1`;
const logger = getLogger();
export class LunchMoneyApi {
    constructor(apiKey) {
        this.request = async (method, endpoint, args = {}) => {
            logger.info(`Lunch Money API request: ${method} ${endpoint}`);
            if (args)
                logger.verbose(`Request args: ${JSON.stringify(args, null, 2)}`);
            let res = await doRequest(method, LM_URL, { Authorization: `Bearer ${this.apiKey}` }, endpoint, args);
            let json = (await res.json());
            if (!res.ok || res.status !== 200) {
                throw new LMError(`Error fetching Lunch Money API: ${res.status} ${res.statusText} \n ${JSON.stringify(json, null, 2)}`);
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
        };
        this.getTransactions = async (query = {}) => {
            const q = { ...query };
            if (q.start_date && !q.end_date) {
                q.end_date = new Date().toISOString().split('T')[0];
            }
            const res = await this.request('GET', `transactions`, q);
            if (res.has_more) {
                logger.warn(`Important: Response has_more=true. There are more transactions to fetch.`);
            }
            logger.verbose(`Fetched ${res.transactions.length} transactions from Lunch Money. has_more is ${res.has_more}`);
            return res;
        };
        this.searchTransactions = (transactions, term) => {
            const s = term.toLowerCase();
            return transactions.filter((t) => {
                return t.payee?.toLowerCase().includes(s) || t.notes?.toLowerCase().includes(s);
            });
        };
        this.getTransaction = (id) => this.request('GET', `transactions/${id}`);
        this.updateTransaction = async (id, transaction, settings) => {
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
                    if (prependNotes) {
                        update.notes = `${prependNotes}${hasNotes ? ' ' : ''}${tr.notes || ''}`;
                        hasNotes = true;
                    }
                    if (appendNotes) {
                        update.notes = `${update.notes || ''}${hasNotes ? ' ' : ''}${appendNotes}`;
                    }
                }
            }
            return this.request('PUT', `transactions/${id}`, {
                transaction: update,
                ...settings,
            });
        };
        this.unsplitTransactions = async (parentIds, removeParents = false) => {
            return this.request('POST', 'transactions/unsplit', {
                parent_ids: parentIds,
                remove_parents: removeParents,
            });
        };
        this.getTransactionGroup = async (id) => {
            return this.request('GET', `transactions/group/${id}`);
        };
        this.deleteTransactionGroup = async (id) => {
            return this.request('DELETE', `transactions/group/${id}`);
        };
        this.createTransactions = async (transactions, settings) => {
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
        };
        this.getAssets = () => this.request('GET', `assets`);
        this.getPlaidAccounts = () => this.request('GET', `plaid_accounts`);
        this.getCategories = (format = 'flattened') => {
            return this.request('GET', `categories`, { format });
        };
        this.createTransactionGroup = async (data) => {
            return this.request('POST', 'transactions/group', data);
        };
        this.getCurrentUser = async () => {
            return this.request('GET', 'me');
        };
        this.getTags = async ({ archived = true } = {}) => {
            let res = await this.request('GET', 'tags');
            if (!archived) {
                res = res.filter((t) => !t.archived);
            }
            return res;
        };
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
}
