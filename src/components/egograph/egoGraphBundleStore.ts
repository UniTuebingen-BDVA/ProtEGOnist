import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});


export const maxRadiusAtom = atom(5);
