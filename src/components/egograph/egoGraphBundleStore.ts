import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout | null;
}>({});



export const innerRadiusAtom = atom(70);
export const outerRadiusAtom = atom(100);
export const maxRadiusAtom = atom(5);
