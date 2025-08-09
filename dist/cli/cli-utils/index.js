#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
import { getTransactionsCommand } from "../transactions.js";
import { getAssetsCommand, getPlaidAccountsCommand } from "../accounts.js";
const program = new Command();
program.addCommand(getTransactionsCommand());
program.addCommand(getAssetsCommand());
program.addCommand(getPlaidAccountsCommand());
program.parse();
