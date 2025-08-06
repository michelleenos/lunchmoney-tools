"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LunchMoneyApi = exports.LM_URL = void 0;
const request_1 = require("./utils/request");
const env_vars_1 = require("./utils/env-vars");
exports.LM_URL = `https://api.lunchmoney.app/v1`;
class LunchMoneyApi {
    constructor(test = false) {
        this.request = async (method, endpoint, args = {}) => {
            let res = await (0, request_1.doRequest)(method, exports.LM_URL, { Authorization: `Bearer ${this.apiKey}` }, endpoint, args);
            let json = (await res.json());
            if (!res.ok || res.status !== 200) {
                throw new Error(`Error fetching Lunch Money API: ${res.status} ${res.statusText} \n ${JSON.stringify(json, null, 2)}`);
            }
            if (typeof json === 'object' && 'error' in json) {
                if (Array.isArray(json.error) && json.error.length > 0) {
                    throw new Error(`Lunch Money API error: ${json.error.join(', ')}`);
                }
                if (typeof json.error === 'string' && json.error.length > 0) {
                    throw new Error(`Lunch Money API error: ${json.error}`);
                }
            }
            return json;
        };
        this.getTransactions = async (query = {}) => {
            return this.request('GET', `transactions`, query);
        };
        this.getTransaction = (id) => this.request('GET', `transactions/${id}`);
        this.updateTransaction = (id, transaction, settings) => {
            return this.request('PUT', `transactions/${id}`, {
                transaction,
                ...settings,
            });
        };
        this.createTransactions = (transactions, settings) => {
            return this.request('POST', `transactions`, {
                transactions,
                ...settings,
            });
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
        this.apiKey = (0, env_vars_1.getEnvVarString)(test ? 'LM_TEST_KEY' : 'LM_API_KEY');
    }
}
exports.LunchMoneyApi = LunchMoneyApi;
