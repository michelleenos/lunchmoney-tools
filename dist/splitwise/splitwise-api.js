// import { doRequest } from '../utils/request'
import { doRequest } from "../utils/request.js";
import { isSplitwiseErrorObject, isSplitwiseErrorString, } from "./types.js";
import { getEnvVarNum, getEnvVarString } from "../utils/env-vars.js";
import { LMError } from "../utils/errors.js";
import { getLogger } from "../cli/cli-utils/logger.js";
import { splitUnevenlyQuery } from "./utils.js";
// import { writeJson } from '../utils/files'
export const SW_URL = 'https://secure.splitwise.com/api/v3.0';
function assertReady(state) {
    if (!state.ready) {
        throw new Error('SplitwiseApi is not initialized. Call init() before making requests.');
    }
}
const logger = getLogger();
export class SplitwiseApi {
    constructor(apiKey, groupId) {
        this.state = { ready: false };
        this.init = async () => {
            let userRes = await this.getCurrentUser();
            let user = userRes.user;
            this.state = { ready: true, userId: user.id };
            logger.info(`SplitwiseApi: Successfully connected to Splitwise; your user ID is: ${user.id}`);
            return this;
        };
        this.request = async (method, endpoint, args = {}) => {
            logger.info(`Splitwise API request: ${method} ${endpoint}`);
            if (args)
                logger.verbose(`Request args:`, args);
            let res = await doRequest(method, SW_URL, { Authorization: `Bearer ${this.apiKey}` }, endpoint, args);
            const json = await res.json();
            // await writeJson('.data', `${Date.now()}-splitwise-${endpoint}.json`, res)
            if (!res.ok || res.status !== 200) {
                if (isSplitwiseErrorObject(json)) {
                    throw new LMError(`Splitwise API error: ${json.errors.base.join(', ')}`, 'api');
                }
                if (isSplitwiseErrorString(json)) {
                    throw new LMError(`Splitwise API error: ${json.error}`, 'api');
                }
                throw new LMError(`Error fetching splitwise API: ${res.status} ${res.statusText}`);
            }
            return json;
        };
        this.getExpense = (id) => {
            return this.request('GET', `get_expense/${id}`);
        };
        this.getExpenses = async ({ dateAfter, dateBefore } = {}) => {
            const args = {
                group_id: this.groupId ?? undefined,
                limit: 999,
            };
            if (dateAfter) {
                args.dated_after = dateAfter;
            }
            if (dateBefore) {
                args.dated_before = dateBefore;
            }
            const res = await this.request('GET', 'get_expenses', args);
            logger.info(`SplitwiseApi.getExpenses: Fetched ${res.expenses.length} expenses from Splitwise`);
            return res.expenses;
        };
        this.getFilteredExpenses = async (opts = {}) => {
            const expenses = await this.getExpenses(opts);
            return this.filterExpenses(expenses, opts);
        };
        this.filterExpenses = (expenses, { filterPayment = true, filterSelf = true, filterDeleted = true } = {}) => {
            let initLen = expenses.length;
            let res = expenses.filter((expense) => {
                if (filterDeleted && expense.deleted_at)
                    return false;
                if (filterPayment && expense.payment)
                    return false;
                if (filterSelf && expense.created_by.id === this.userId)
                    return false;
                return true;
            });
            logger.verbose(`SplitwiseApi.filterExpenses: From ${initLen} expenses, filtered to ${res.length} using options:`, { filterPayment, filterDeleted, filterSelf });
            return res;
        };
        this.createGroupExpense = (args) => {
            if (!this.groupId) {
                throw new LMError('Sorry, this package does not support creating Splitwise expenses without a group.', 'config');
            }
            const allArgs = {
                ...args,
                group_id: this.groupId,
            };
            return this.request('POST', 'create_expense', allArgs);
        };
        // createGroupExpenseUnequal = <T extends readonly { id: number; percent: number }[]>(
        //     expense: Omit<SplitwiseExpenseCreate, 'group_id' | 'split_equally'>,
        //     members: T
        // ): Promise<SplitwiseExpenseCreateResponse> => {
        //     if (!this.groupId) {
        //         throw new LMError(
        //             'Sorry, this package does not support creating Splitwise expenses without a group.',
        //             'config'
        //         )
        //     }
        //     const shares = splitUnevenlyQuery(members, parseFloat(expense.cost))
        //     const expenseArgs: SplitwiseExpenseCreateUnequal<T['length']> = {
        //         ...expense,
        //         ...shares,
        //         cost: expense.cost,
        //         group_id: this.groupId,
        //         split_equally: false,
        //     }
        //     return this.request<SplitwiseExpenseCreateResponse>('POST', 'create_expense', expenseArgs)
        // }
        this.getEqualExpenseCreateObject = (expense) => {
            if (!this.groupId) {
                throw new LMError('Sorry, this package does not support creating Splitwise expenses without a group.', 'config');
            }
            return {
                ...expense,
                cost: expense.cost,
                group_id: this.groupId,
                split_equally: true,
            };
        };
        this.getCurrentUser = async () => {
            return this.request('GET', 'get_current_user');
        };
        this.getCurrentGroup = async (groupId) => {
            if (!groupId && !this.groupId) {
                throw new LMError('No group ID set. Please set the SW_GROUP_ID environment variable, or pass a group ID to the SplitwiseApi constructor or getCurrentGroup method.', 'config');
            }
            return this.request('GET', `get_group/${this.groupId}`);
        };
        logger.start('Initializing SplitwiseApi');
        try {
            if (apiKey) {
                this.apiKey = apiKey;
            }
            else {
                this.apiKey = getEnvVarString('SW_API_KEY');
                logger.info('Using Splitwise API key from environment variable SW_API_KEY');
            }
        }
        catch (e) {
            throw new LMError(`Missing Splitwise API key. Please set the SW_API_KEY environment variable.`, 'auth');
        }
        if (groupId === false) {
            this.groupId = null;
        }
        else if (typeof groupId === 'number') {
            this.groupId = groupId;
            logger.info(`Using Splitwise group ID from constructor: ${groupId}`);
        }
        else {
            try {
                this.groupId = getEnvVarNum('SW_GROUP_ID');
                logger.info(`Using Splitwise group ID from environment variable SW_GROUP_ID: ${this.groupId}`);
            }
            catch (e) {
                throw new LMError(`Missing Splitwise group ID. Please set the SW_GROUP_ID environment variable.`, 'config');
            }
        }
    }
    get userId() {
        assertReady(this.state);
        return this.state.userId;
    }
    getExpenseCreateObject(expense, members) {
        if (!this.groupId) {
            throw new LMError('Sorry, this package does not support creating Splitwise expenses without a group.', 'config');
        }
        if (members && members.length > 0) {
            const { shares, userShare } = splitUnevenlyQuery(members, parseFloat(expense.cost));
            const expenseArgs = {
                ...expense,
                ...shares,
                cost: expense.cost,
                group_id: this.groupId,
                split_equally: false,
            };
            return expenseArgs;
        }
        else {
            const expenseArgs = {
                ...expense,
                cost: expense.cost,
                group_id: this.groupId,
                split_equally: true,
            };
            return expenseArgs;
        }
    }
}
