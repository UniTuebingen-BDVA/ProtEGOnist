import { atom } from 'jotai';

export const hoverColor = '#6db463';
const hoverStoreAtom = atom('');

export const hoverAtom = atom(
    (get) => get(hoverStoreAtom),
    (_get, set, value: string) => {
        set(hoverStoreAtom, value);
    }
);
