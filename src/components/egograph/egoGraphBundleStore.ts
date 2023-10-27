import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});

// TODO: create write only atom here for recalculation of layout when mode is changed

export const maxRadiusAtom = atom(5);
