#! /usr/bin/env node

import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { printAccounts } from '../cli-utils/print.ts'
import { ChildCommandType } from '../index.ts'
import { getLogger } from '../cli-utils/logger.ts'

const logger = getLogger()

export const getAssetsCommand = () => {
    const program: ChildCommandType = new Command()

    return program.command('get-assets').action(
        programWrapper(async (_opts, command) => {
            const { verbose } = command.optsWithGlobals()
            if (verbose) logger.level = 'verbose'

            const lm = new LunchMoneyApi()
            const res = await lm.getAssets()

            printAccounts(res.assets)
        })
    )
}

export const getPlaidAccountsCommand = () => {
    const program: ChildCommandType = new Command()

    return program.command('get-plaid').action(
        programWrapper(async (_opts, command) => {
            const { verbose } = command.optsWithGlobals()
            if (verbose) logger.level = 'verbose'
            const lm = new LunchMoneyApi()
            const res = await lm.getPlaidAccounts()

            printAccounts(res.plaid_accounts)
        })
    )
}

export const getAccountsCommand = () => {
    const program: ChildCommandType = new Command()

    return program.command('get-accounts').action(
        programWrapper(async (_opts, command) => {
            const { verbose } = command.optsWithGlobals()
            if (verbose) logger.level = 'verbose'

            const lm = new LunchMoneyApi()

            const plaidRes = await lm.getPlaidAccounts()
            const assetRes = await lm.getAssets()

            printAccounts([...plaidRes.plaid_accounts, ...assetRes.assets])
        })
    )
}
