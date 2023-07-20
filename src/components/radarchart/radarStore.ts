import { atom } from 'jotai';
import { intersectionDatum } from '../../egoGraphSchema';

export const intersectionAtom = atom<{
    [name: string | number]: intersectionDatum;
}>({});

export const tarNodeAtom = atom<string>('');
