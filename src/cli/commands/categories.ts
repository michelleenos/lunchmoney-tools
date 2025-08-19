#! /usr/bin/env node

import 'dotenv/config'
import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { ChildCommandType } from '../index.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { printCategories } from '../cli-utils/print.ts'

const logger = getLogger()

export const getCategoriesCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-categories')
        .description('List Lunch Money categories and IDs')
        .option('--no-description', 'Do not show category descriptions')
        .option('--no-id', 'Do not show category IDs')
        .action(
            programWrapper(async (_opts, command) => {
                const { verbose, apiKey, description, id } = command.optsWithGlobals()
                if (verbose) logger.level = Infinity

                const lm = new LunchMoneyApi(apiKey)
                const res = await lm.getCategories('nested')

                const cats = res.categories
                printCategories(cats, { isNested: true, showDescription: description, showId: id })
            })
        )
}
