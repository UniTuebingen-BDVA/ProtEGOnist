import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';
import { egoGraphBundlesAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});

export const sortNodesBy=atom<string>("distance");
export const selectedBandAtom = atom('');

export const filteredIntersectionsAtom = atom((get) => {
    const selectedBand = get(selectedBandAtom);
    const egoBundles = get(egoGraphBundlesAtom);
    // find the intersection that matches the selected band
    const containingBundle = Object.values(egoBundles).find((bundle) =>
        Object.keys(bundle.intersections).includes(selectedBand)
    );
    const nodes = containingBundle
        ? containingBundle.intersections[selectedBand]
        : [];
    return nodes;
});
