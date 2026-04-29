import { Command } from '@commander-js/extra-typings';
export declare const createProgram: () => Command<[], {
    verbose?: true | undefined;
    apiKey?: string | undefined;
}, {}>;
export type RootProgramOpts = ReturnType<ReturnType<typeof createProgram>['opts']>;
export type ChildCommandType = Command<[], {}, RootProgramOpts>;
