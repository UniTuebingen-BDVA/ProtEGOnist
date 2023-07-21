import { atom } from 'jotai';
import { intersectionDatum } from '../../egoGraphSchema';

export const radarSVGSizeAtom = atom({ width: 400, height: 400 });

export const intersectionAtom = atom<{
    [name: string | number]: intersectionDatum;
}>({});

export const tarNodeAtom = atom<string>('');