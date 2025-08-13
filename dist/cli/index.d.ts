#! /usr/bin/env node
import 'dotenv/config';
import { Command } from '@commander-js/extra-typings';
declare const createProgram: () => Command<[], {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}, {}>;
export type RootProgramOpts = ReturnType<ReturnType<typeof createProgram>['opts']>;
export type ChildCommandType = Command<[], {}, RootProgramOpts>;
export {};
