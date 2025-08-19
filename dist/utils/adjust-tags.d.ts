import { LMTag } from '../types/tags.ts';
export declare const adjustTags: (existing: LMTag[], { add, remove }: {
    add?: (string | number)[];
    remove?: (string | number)[];
}) => (string | number)[];
