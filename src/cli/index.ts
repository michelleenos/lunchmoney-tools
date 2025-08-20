#! /usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import {
    getTransactionCommand,
    getTransactionsCommand,
    updateTransactionCommand,
} from './commands/transactions.ts'
import {
    getAccountsCommand,
    getAssetsCommand,
    getPlaidAccountsCommand,
} from './commands/accounts.ts'
import {
    getSplitwiseExpensesCommand,
    getSplitwiseGroupCommand,
    lmToSplitwiseCommand,
    splitwiseToLMCommand,
} from './commands/splitwise.ts'
import { getCategoriesCommand } from './commands/categories.ts'
import { getTagsCommand } from './commands/tags.ts'

const createProgram = () => {
    const program = new Command()
        .option('-v, --verbose', 'Enable verbose logging')
        .option(
            '--api-key <KEY>',
            'Lunch Money API key (if not set will look for LM_API_KEY in env)'
        )

    return program
}

const program = createProgram().name('lm-tools')

program.addCommand(getTransactionsCommand())
program.addCommand(getTransactionCommand())
program.addCommand(updateTransactionCommand())
program.addCommand(getAssetsCommand())
program.addCommand(getPlaidAccountsCommand())
program.addCommand(getAccountsCommand())
program.addCommand(getCategoriesCommand())
program.addCommand(getTagsCommand())
program.addCommand(getSplitwiseExpensesCommand())
program.addCommand(getSplitwiseGroupCommand())
program.addCommand(splitwiseToLMCommand())
program.addCommand(lmToSplitwiseCommand())

program.parse()

export type RootProgramOpts = ReturnType<ReturnType<typeof createProgram>['opts']>
export type ChildCommandType = Command<[], {}, RootProgramOpts>
