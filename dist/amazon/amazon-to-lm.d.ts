import { LunchMoneyApi } from '../api.ts';
import { LMTransaction } from '../types/index.ts';
import { AmazonCSVData, TransformedAmazonData } from './types.ts';
export interface AmazonToLMOpts {
    /**
     * path to CSV file from Amazon order scraper
     */
    filePath: string;
    filters?: {
        /**
         * to field (exact match)
         */
        to?: string;
        /**
         * payment field (contains)
         */
        payment?: string;
    };
    /**
     * tags to add to LM transaction
     * @default ['amazon-link']
     */
    tags?: string[];
    /**
     * exclude LM transactions with this tag
     * @default ['amazon-link']
     */
    excludeTags?: string[];
    startDate?: string;
    endDate?: string;
    verbose?: boolean;
    dryRun?: boolean;
}
export declare const amazonToLM: (lunchMoney: LunchMoneyApi, { filters, tags, excludeTags, startDate, endDate, verbose, filePath, dryRun, }: AmazonToLMOpts) => Promise<false | {
    successes: {
        amazon: TransformedAmazonData;
        lunchMoney: LMTransaction;
    }[];
    errors: {
        amazon: TransformedAmazonData;
        lunchMoney: LMTransaction;
        error?: any;
    }[];
    extraMatches: {
        data: TransformedAmazonData;
        matches: LMTransaction[];
    }[];
    unmatched: TransformedAmazonData[];
    rowsWithIssues: Omit<AmazonCSVData, "to" | "payments">[];
}>;
