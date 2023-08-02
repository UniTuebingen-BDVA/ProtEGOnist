import { atom } from 'jotai';
export const graphSVGSizeAtom = atom({width: 400, height: 400});
export const bundleGroupSizeAtom=atom({width:400,height:400})
export const maxRadiusAtom = atom(5);
/*export const outerRadiusAtom = atom((get) => {
    return get(graphSizeAtom) / 2 - get(maxRadiusAtom);
});
export const innerRadiusAtom = atom((get) => {
    return get(outerRadiusAtom) * (2 / 3);
});*/
