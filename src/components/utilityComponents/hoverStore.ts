import { atom } from 'jotai';

export const hoverColor = '#6db463';
export const isHoveredAtom = atom(false);
export const hoverIdAtom = atom('');

export const hoverAtom = atom(null, (_get, set, value: string) => {
    set(isHoveredAtom, value !== '');
    if (value !== '') {
        set(hoverIdAtom, value);
    }
});
