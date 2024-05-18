import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';

export const nodeRadius=5;
export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});

export const sortNodesBy = atom<string>('distance');


