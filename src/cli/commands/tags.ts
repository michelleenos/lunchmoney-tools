#! /usr/bin/env node

import { Command } from '@commander-js/extra-typings'
import { LunchMoneyApi } from '../../api.ts'
import { programWrapper } from '../cli-utils/program-wrapper.ts'
import { ChildCommandType } from '../index.ts'
import { getLogger } from '../cli-utils/logger.ts'
import { printTable, Table } from 'console-table-printer'
import { display } from '../cli-utils/write-stuff.ts'
import { ColumnOptionsRaw } from 'console-table-printer/dist/src/models/external-table.js'
import { printTags } from '../cli-utils/print.ts'

const logger = getLogger()

export const getTagsCommand = () => {
    const program: ChildCommandType = new Command()

    return program
        .command('get-tags')
        .description('List Lunch Money tags with descriptions and IDs')
        .option('-s, --sort', 'Sort tags alphabetically by name')
        .option('--no-archived', 'Do not display archived tags')
        .option('--no-description', 'Do not display tag descriptions')
        .option('--no-id', 'Do not display tag IDs')
        .action(
            programWrapper(async (_opts, command) => {
                const { verbose, apiKey, archived, sort, description, id } =
                    command.optsWithGlobals()
                if (verbose) logger.level = Infinity

                const lm = new LunchMoneyApi(apiKey)
                const tags = await lm.getTags({ archived })

                printTags(tags, {
                    showArchived: archived,
                    sort,
                    showId: id,
                    showDescription: description,
                })

                // let columns: ColumnOptionsRaw[] = [
                //     { name: 'id' },
                //     { name: 'name' },
                //     { name: 'description', maxLen: 50 },
                // ]
                // if (archived) columns.push({ name: 'archived', alignment: 'right' })
                // let enabledColumns = columns.map((c) => c.name)

                // printTable(
                //     tags.map((tag) => ({
                //         id: tag.id,
                //         name: tag.name,
                //         description: display(tag.description, 0),
                //         archived: archived ? (tag.archived ? 'yes' : 'no') : undefined,
                //     })),
                //     {
                //         columns,
                //         enabledColumns,
                //         sort: sort ? (a, b) => a.name.localeCompare(b.name) : undefined,
                //     }
                // )
            })
        )
}
