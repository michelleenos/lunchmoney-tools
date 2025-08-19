#! /usr/bin/env node
import { Command } from '@commander-js/extra-typings';
function collect(value, previous) {
    return previous.concat([value]);
}
const program = new Command();
program
    // .option('-n, --number <value...>', 'specify numbers')
    // .option('-l, --letter <value...>', 'specify letters')
    // .option('-c, --collect <value...>', 'repeatable value', collect, [])
    .option('--shares <string...>', 'user shares in format "userId=sharePercent"', collectShares)
    // .option('-t, --tag <string...>', 'Tag(s) to add to each transaction')
    .action((options) => {
    console.log('Options: ', options);
})
    .parse();
function collectShares(value, previous = []) {
    const [idStr, percentStr] = value.split('=');
    const id = parseInt(idStr);
    const percent = parseFloat(percentStr);
    if (isNaN(id) || isNaN(percent)) {
        program.error(`Invalid share format: ${value}. Use "userId=sharePercent".`, { exitCode: 1 });
    }
    return previous.concat([{ id, percent }]);
}
