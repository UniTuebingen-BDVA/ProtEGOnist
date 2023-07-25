import { atom } from 'jotai';
const bundleSizeAtom=atom(1);
export const egoGraphBundleAtom=atom({ graphs:[],intersections:[] })
export const circlePortionAtom=atom((get)=>1/get(bundleSizeAtom))