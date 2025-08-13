# Lunch Money JS/TS Tools

This package includes a JavaScript client for the Lunch Money API, as well a CLI tool for interacting with Lunch Money transactions and data.

# Lunch Money JS/TS Tools

A TypeScript client for the [Lunch Money API](https://lunchmoney.dev/) with command-line tools and Splitwise integration.

## ✨ Features

-   📝 **Full TypeScript Support** with complete type definitions for API responses and requests
-   🤖 **CLI Tools** for performing common operations and queries
-   🎨 **Console Output** - Colorized and formatted tables for data display
-   💾 **Data Export** - Option to export data to JSON files
-   🔄 **Splitwise integration** - Tools for importing expenses from Splitwise to Lunch Money

## Installation

```bash
npm install lunchmoney-tools
# or
pnpm install lunchmoney-tools
```

## Environment Setup

You can provide your API key directly to the API (via command line or JS), or set it as an environment variable. To set an environment variable, create a `.env` file in your project root:

```env
LM_API_KEY=[YOURKEY]
```

(Get your Lunch Money API key from https://my.lunchmoney.app/developers).

## API Client Usage

```typescript
import { LunchMoneyApi } from 'lunchmoney-tools'

// Default, uses API key set in env
const lm = new LunchMoneyApi()

// or pass API key directly
const lm = new LunchMoneyApi('your-api-key')

const transactions = await lm.getTransactions({
    start_date: '2024-01-01',
    end_date: '2024-01-31',
})

await lm.createTransactions([
    {
        date: '2024-01-15',
        amount: '25.50',
        payee: 'Coffee Shop',
        asset_id: 123,
        category_id: 456,
    },
])
```

## CLI Usage

```bash
## list all commands
lm-tools help

## view options & details for a specific command
lm-tools help [command]
lm-tools help get-transactions
```

### Transactions

```bash
# Get recent transactions
lm-tools get-transactions

# Get transactions for a specific date range
lm-tools get-transactions --start 2024-01-01 --end 2024-01-31

# Search transactions
lm-tools get-transactions --search "coffee"

# Filter by category or asset
lm-tools get-transactions --cat-id 123 --asset 456

# Export to JSON
lm-tools get-transactions --write-file ./data/
```

### Accounts

```bash
# List all accounts (assets + Plaid accounts)
lm-tools get-accounts

# List only manually managed assets
lm-tools get-assets

# List only Plaid accounts
lm-tools get-plaid
```

### Categories

```bash
# List all categories
lm-tools get-categories
```

### Splitwise Integration

```bash
# List Splitwise expenses
lm-tools list-sw-expenses --start-date 2024-01-01

# Import Splitwise expenses to Lunch Money
lm-tools splitwise-to-lm --start-date 2024-01-01 --asset-id 123

# Dry run (preview without importing)
lm-tools splitwise-to-lm --start-date 2024-01-01 --asset-id 123 --dry-run

# Compare Splitwise expenses with Lunch Money transactions
lm-tools sw-match --start 2024-01-01 --end 2024-01-31
```

## API Reference

### Core Classes

#### [`LunchMoneyApi`](src/api.ts)

Main client for interacting with the Lunch Money API.

```typescript
class LunchMoneyApi {
    constructor(apiKey?: string)

    // Transactions
    getTransactions(
        query?: LMTransactionsQuery
    ): Promise<{ transactions: LMTransaction[]; has_more?: boolean }>

    getTransaction(id: number): Promise<LMTransaction>

    createTransactions(
        transactions: LMInsertTransactionObject[],
        settings?: LMInsertTransactionsSettings
    ): Promise<LMInsertTransactionsResponse>

    updateTransaction(
        id: number,
        transaction: LMUpdateTransactionObject,
        settings?: Omit<LMUpdateTransactionBody, 'transaction'>
    ): Promise<LMUpdateTransactionResponse>

    // Categories
    getCategories(format?: 'flattened' | 'nested'): Promise<{ categories: LMCategory[] }>

    // Accounts
    getAssets(): Promise<{ assets: LMAsset[] }>

    getPlaidAccounts(): Promise<{ plaid_accounts: LMPlaidAccount[] }>

    // User
    getCurrentUser(): Promise<LMUser>
}
```

### Type Definitions

All types are exported from the main package:

```typescript
import type {
    LMTransaction,
    LMCategory,
    LMAsset,
    LMUser,
    LMInsertTransactionObject,
    LMTransactionsQuery,
    SplitwiseExpense,
} from 'lunchmoney-tools'
```

Key types include:

-   [`LMTransaction`](src/types/transactions/base.ts) - Complete transaction object
-   [`LMTransactionsQuery](src/types/transactions/query.ts) - Interface used to create transactions
-   [`LMTag`](src/types/tags.ts)
-   [`LMCategory`](src/types/categories.ts)
-   [`LMAsset` and `LMPlaidAccount`](src/types/assets-and-accounts.ts)

## Configuration

### Environment Variables

| Variable         | Description                                     | Required |
| ---------------- | ----------------------------------------------- | -------- |
| `LM_API_KEY`     | Your Lunch Money API key                        | Yes      |
| `SW_API_KEY`     | Splitwise API key (for Splitwise features)      | No       |
| `SW_GROUP_ID`    | Splitwise group ID                              | No       |
| `LM_SW_ASSET_ID` | Lunch Money asset ID for Splitwise transactions | No       |

### CLI Options

Global options available for all commands:

-   `--verbose, -v` - Enable verbose logging
-   `--api-key <key>` - Override API key from environment

## Examples

### Transaction Management

```typescript
import { LunchMoneyApi } from 'lunchmoney-tools'

const lm = new LunchMoneyApi()

// Search for coffee purchases
const allTransactions = await lm.getTransactions({
    start_date: '2024-01-01',
    end_date: '2024-12-31',
})

const coffeeTransactions = lm.searchTransactions(allTransactions.transactions, 'coffee')

// Update a transaction
await lm.updateTransaction(12345, {
    category_id: 678,
    notes: 'Updated via API',
})
```

### Splitwise Integration

```typescript
import { splitwiseToLM } from 'lunchmoney-tools'

// Import Splitwise expenses to Lunch Money
await splitwiseToLM({
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    assetId: 123,
    tag: ['splitwise', 'imported'],
    dryRun: false,
})
```

## Error Handling

The package includes a custom error class [`LMError`](src/utils/errors.ts) for API-related errors:

```typescript
import { LMError } from 'lunchmoney-tools'

try {
    await lm.getTransactions()
} catch (error) {
    if (error instanceof LMError) {
        console.log(`${error.type} error: ${error.message}`)
        // Error types: 'auth', 'config', 'api', 'unknown'
    }
}
```

## License

ISC
