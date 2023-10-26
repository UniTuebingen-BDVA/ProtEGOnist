import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});

// TODO: create write only atom here for recalculation of layout when mode is changed

export const innerRadiusAtom = atom(70);
export const outerRadiusAtom = atom(100);
export const maxRadiusAtom = atom(5);
