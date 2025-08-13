#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { LunchMoneyApi } from "../../api.js";
import { programWrapper } from "../cli-utils/program-wrapper.js";
import { getLogger } from "../cli-utils/logger.js";
import { Table } from 'console-table-printer';
const logger = getLogger();
export const getCategoriesCommand = () => {
    const program = new Command();
    return program.command('get-categories').action(programWrapper(async (_opts, command) => {
        const { verbose, apiKey } = command.optsWithGlobals();
        if (verbose)
            logger.level = 'verbose';
        const lm = new LunchMoneyApi(apiKey);
        const res = await lm.getCategories('nested');
        const cats = res.categories;
        const t = new Table();
        t.addColumns([
            { name: 'id', color: 'white' },
            { name: 'name', alignment: 'left' },
        ]);
        // t.addColumn({ name: 'name', alignment: 'left' })
        cats.forEach((c) => {
            t.addRow({
                id: c.id,
                name: `${c.name} ${c.is_income ? '💰' : ''}`,
            }, { color: 'green' });
            if (c.children) {
                let count = c.children.length;
                c.children.forEach((child, i) => {
                    t.addRow({
                        id: child.id,
                        name: `   ${child.name}`,
                    }, { separator: i === count - 1 ? true : false });
                });
            }
        });
        t.printTable();
    }));
};
