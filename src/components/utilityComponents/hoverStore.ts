import { atom } from 'jotai';

const hoverStoreAtom = atom('');

export const hoverAtom = atom(
    (get) => get(hoverStoreAtom),
    (_get, set, value: string) => {
        set(hoverStoreAtom, value);
    }
);
