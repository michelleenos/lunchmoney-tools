# Lunch Money JS/TS Tools

A TypeScript client for the [Lunch Money API](https://lunchmoney.dev/) with command-line tools and Splitwise integration.

I needed a way to manage transactions programatically, particularly for importing/updating multiple expenses at once. While I have tested this library extensively with my own accounts, I have certainly not tested every case. To be safe, try running commands with the `--dry-run` flag first to see what would happen without actually making changes. Please feel free to open issues or PRs if you find bugs or have feature requests!

## Contents

-   [Features](#-features)
-   [Environment Setup](#environment-setup)
-   [CLI Usage](#cli-usage)
    -   [List of Commands](#list-of-commands)
    -   [Transactions](#transactions)
    -   [Accounts](#accounts)
    -   [Categories / Tags](#categories--tags)
    -   [Splitwise Integration](#splitwise-integration)
-   [API Reference](#api-reference)
    -   [LunchMoneyApi](#lunchmoneyapi)
    -   [Type Definitions](#type-definitions)
    -   [API Examples](#api-examples)
-   [License](#license)

## ✨ Features

-   📝 **Full TypeScript Support** with complete type definitions for API responses and requests
-   🤖 **CLI Tools** for performing common operations and queries
-   🎨 **Console Output** - Colorized and formatted tables for data display
-   💾 **Data Export** - Option to export data to JSON files
-   🔄 **Splitwise integration** - Tools for importing expenses from Splitwise to Lunch Money

## Environment Setup

All environment variables can be provided via CLI or to the API client directly, but it's recommended to set them as environment variables for convenience. To do so, create an `.env` file in your project root and include:

```env
LM_API_KEY=[YOURKEY]
```

(See [.env.example](.env.example) for a template `.env` file.)

A Lunch Money API key is required for all operations. Additional variables are needed for Splitwise integration.

| Variable         | Description                                                                                              | Required       |
| ---------------- | -------------------------------------------------------------------------------------------------------- | -------------- |
| `LM_API_KEY`     | Your Lunch Money API key. Obtain from https://my.lunchmoney.app/developers.                              | Yes            |
| `SW_API_KEY`     | Splitwise API key (required for Splitwise features). Obtained from https://secure.splitwise.com/apps     | Splitwise only |
| `SW_GROUP_ID`    | Splitwise group ID - find from Splitwise group URL: `https://secure.splitwise.com/#/groups/[GROUP_ID]/`  | Splitwise only |
| `LM_SW_ASSET_ID` | ID of Lunch Money asset for importing Splitwise transactions (use `lm-tools get-assets` to find this ID) | Splitwise only |

## CLI Usage

### List of Commands

```bash
Usage: lm-tools [options] [command]

Options:
  -v, --verbose                      Enable verbose logging
  --api-key <KEY>                    Lunch Money API key (if not set will look for LM_API_KEY in env)
  -h, --help                         display help for command

Commands:
  get-transactions [options]         List transactions, with optional filtering
  get-transaction [options] <id>     Get a specific transaction by ID
  update-transaction [options] <id>  Update a single transaction by ID
  get-assets                         List all manually managed assets
  get-plaid                          List all Plaid-linked accounts
  get-accounts                       List both Plaid accounts and manually managed assets
  get-categories [options]           List Lunch Money categories and IDs
  get-tags [options]                 List Lunch Money tags with descriptions and IDs
  list-sw-expenses [options]         List Splitwise expenses with optional filtering
  get-splitwise-group [options]      Display information about members of a Splitwise group
  splitwise-to-lm [options]          Import Splitwise expenses to Lunch Money as transactions
  lm-to-splitwise [options]          Import Lunch Money transactions to a Splitwise group
  help [command]                     display help for command
```

### Transactions

```bash
Usage: lm-tools get-transactions [options]

Options:
  -s, --start <date>        Start date for transactions
  -e, --end <date>          End date for transactions
  -t, --tag-id <number>     Filter transactions by tag ID
  -c, --cat-id <number>     Filter transactions by category ID
  -a, --asset <number>      Filter transactions by asset ID
  -p, --plaid <number>      Filter transactions by Plaid account ID
  -r, --reviewed            only return reviewed transactions
  -u, --no-reviewed         only return unreviewed transactions
  --search <string>         Search transactions by payee
  --show-ext-id             Display transaction external ID in output
  --show-tags               Display transaction tags in output
  --no-show-notes           Do not display transaction notes
  --no-show-category        Do not display category in output
  --no-show-account         Do not display account in output
  --no-show-id              Do not display transaction IDs in output
  --write-file [directory]  Write transactions to a json file instead of printing to console
  -h, --help                display help for command
```

#### Get single transaction by ID:

```bash
Usage: lm-tools get-transaction [options] <id>

Options:
  --show-ext-id             Show transaction external ID
  --show-tags               Show transaction tags
  --no-show-category        Do not show transaction category in output
  --no-show-account         Do not show transaction account in output
  --no-show-id              Do not show transaction ID in output
  --show-notes              Show transaction notes
  --write-file [directory]  Write transaction to a json file instead of printing to console
  -h, --help                display help for command
```

#### Update Transaction

```bash
Usage: lm-tools update-transaction [options] <id>

Options:
  -a, --amount <amount>       Set transaction amount
  -n, --notes <notes>         New notes for the transaction
  -p, --payee <payee>         New payee
  -t, --tags <tag...>         New transaction tags (space-separated)
  -c, --category-id <number>  New category ID
  --dry-run                   Do not actually perform the update, just show what would be done
  -h, --help                  display help for command
```

### Accounts

```bash
# List all accounts (assets + Plaid accounts)
lm-tools get-accounts

# List manually managed assets
lm-tools get-assets

# List Plaid accounts
lm-tools get-plaid
```

### Categories / Tags

```bash
# List all categories
lm-tools get-categories

# List all tags
lm-tools get-tags
```

### Splitwise Integration

To use Splitwise integration, you will need to set a Splitwise API key as an environment variable. To import/export transactions you will also need to specify a Splitwise group ID.

To import transactions from Splitwise to Lunch Money, you will also need to specify a Lunch Money asset ID to associate the imported transactions with. This should be a manually managed asset you have created specifically for Splitwise imports. (See [Environment Setup](#environment-setup) for details on setting these variables.)

#### List Splitwise Expenses

```bash
Usage: lm-tools list-sw-expenses [options]

List Splitwise expenses with optional filtering

Options:
  -s, --start-date <date>
  -e, --end-date <date>
  --no-filter-self         Include expenses created by the current user.
  --no-filter-payment      Include payments.
  --group <id>             Splitwise group ID
  --no-group               Do not try to use SW_GROUP_ID environment variable
  --sw-api-key <string>    Splitwise API key
  -h, --help               display help for command
```

#### Import Splitwise Expenses to Lunch Money

```bash
Usage: lm-tools splitwise-to-lm [options]

Import Splitwise expenses to Lunch Money as transactions

Options:
  -a, --asset-id <number>  Lunch Money asset ID for Splitwise imports
  -s, --start-date <date>  Start date
  -e, --end-date <date>    End date
  -t, --tag <string...>    Tag(s) to add to each transaction (default: ["splitwise-imported"])
  --handle-dupes <option>  "update" or "skip" (default "update") (default: "update")
  --no-filter-self         By default, we will filter out expenses created by the current user; use this flag to include them.
  --group <id>             Splitwise group ID. If not provided, will use SW_GROUP_ID env var
  --sw-api-key <string>    Splitwise API key. If not provided, will use SW_API_KEY env var
  --dry-run                Print transactions to console instead of adding them
  -h, --help               display help for command
```

#### Import Lunch Money Transactions to Splitwise

```bash
Usage: lm-tools lm-to-splitwise [options]

Import Lunch Money transactions to a Splitwise group

Options:
  -t, --tag-id <number>       Lunch Money tag ID to pull transactions from
  -s, --start-date <date>     Start date
  -e, --end-date <date>       End date
  --exclude-tags <string...>  Tag(s) to exclude, comma-separated (default: ["splitwise-auto-added"])
  --add-tag <string>          Tag to add to Splitwise expenses (default: "splitwise-auto-added")
  --shares <string...>        user shares for unequal split. write in format "userId=sharePercent"
  --remove-tag                Remove the tag from the LM transaction after adding to Splitwise
  --group <id>                Splitwise group ID. If not provided, will use SW_GROUP_ID env var
  --sw-api-key <string>       Splitwise API key. If not provided, will use SW_API_KEY env var
  --dry-run                   Print transactions to console instead of adding them
  -h, --help                  display help for command
```

## API Reference

### [`LunchMoneyApi`](src/api.ts)

Main client for interacting with Lunch Money.

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

Key types:

-   [`LMTransaction`](src/types/transactions/base.ts) - Complete transaction object
-   [`LMTransactionsQuery`](src/types/transactions/query.ts) - Interface used to create transactions
-   [`LMTag`](src/types/tags.ts)
-   [`LMCategory`](src/types/categories.ts)
-   [`LMAsset` and `LMPlaidAccount`](src/types/assets-and-accounts.ts)

### API Examples

#### Transaction Management

```typescript
import { LunchMoneyApi } from 'lunchmoney-tools'

// Default, uses API key set in env
const lm = new LunchMoneyApi()

// or pass API key directly
const lm = new LunchMoneyApi('your-api-key')

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

#### Splitwise Integration

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

## License

ISC
