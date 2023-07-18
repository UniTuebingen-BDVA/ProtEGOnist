import { atom } from 'jotai';

export const graphSizeAtom = atom(400);
export const minRadiusAtom = atom(5);
export const outerRadiusAtom = atom((get) => {
    return get(graphSizeAtom) / 2 - get(minRadiusAtom);
});
export const innerRadiusAtom = atom((get) => {
    return get(outerRadiusAtom) * (2 / 3);
});
