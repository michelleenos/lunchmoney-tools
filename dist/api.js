import { doRequest } from "./utils/request.js";
import { getEnvVarString } from "./utils/env-vars.js";
import { LMError } from "./utils/errors.js";
import { getLogger } from "./cli/cli-utils/logger.js";
export const LM_URL = `https://api.lunchmoney.app/v1`;
const logger = getLogger();
export class LunchMoneyApi {
    constructor(test = false) {
        this.request = async (method, endpoint, args = {}) => {
            logger.info(`Lunch Money API request: ${method} ${endpoint}`);
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
            const res = await this.request('GET', `transactions`, query);
            logger.verbose(`Fetched ${res.transactions.length} transactions from Lunch Money. has_more is ${res.has_more}`);
            return res;
        };
        this.getTransaction = (id) => this.request('GET', `transactions/${id}`);
        this.updateTransaction = (id, transaction, settings) => {
            logger.verbose(`Will attempt to update transaction ${id} with data:`, transaction);
            return this.request('PUT', `transactions/${id}`, {
                transaction,
                ...settings,
            });
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
        try {
            this.apiKey = getEnvVarString(test ? 'LM_TEST_KEY' : 'LM_API_KEY');
        }
        catch (e) {
            throw new LMError(`Missing Lunch Money API key. Please set the LM_API_KEY environment variable.`, 'auth');
        }
        logger.info(`Initializing LunchMoney API`);
    }
}
