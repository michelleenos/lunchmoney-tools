export declare const writeJson: (dir: string, fileName: string, data: any) => Promise<void>;
export type WriteFilesOpt = boolean | string;
export declare const getDataFilesDir: (writeFiles: WriteFilesOpt, defaultSuffix: string) => string;
