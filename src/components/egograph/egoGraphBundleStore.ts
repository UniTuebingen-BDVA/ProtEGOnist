import { atom } from 'jotai';
import { egoGraph } from '../../egoGraphSchema.ts';

export const egoGraphBundlesDataAtom = atom<{
    [key: string]: {
        egoGraphs: egoGraph[];
        intersections: { [key: string]: string[] };
    } | null;
}>({});
export const innerRadiusAtom = atom(50);
export const outerRadiusAtom = atom(70);
