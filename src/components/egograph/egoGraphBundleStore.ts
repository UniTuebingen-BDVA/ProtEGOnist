import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';
import { egoGraphBundlesAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout;
}>({});

export const sortNodesBy = atom<string>('distance');
const selectedEgoGraphsBaseAtom = atom<string[]>([]);
const selectedBandsBaseAtom = atom<string[]>([]);
/**
 * Stores currently selected ego-graphs
 */
export const selectedEgoGraphsAtom = atom(
    (get) => get(selectedEgoGraphsBaseAtom),
    (get, set, value:string) => {
        const prevSelection = get(selectedEgoGraphsBaseAtom).slice();
        const valIdx = prevSelection.indexOf(value);
        if (valIdx !== -1) {
            prevSelection.splice(valIdx);
        } else {
            prevSelection.push(value);
        }
        set(selectedEgoGraphsBaseAtom, prevSelection);
    }
);
/**
 * stores currently selected bands
 */
export const selectedBandsAtom = atom(
    (get) => get(selectedBandsBaseAtom),
    (get, set, value:string) => {
        const prevSelection = get(selectedBandsBaseAtom).slice();
        const valIdx = prevSelection.indexOf(value);
        if (valIdx !== -1) {
            prevSelection.splice(valIdx);
        } else {
            prevSelection.push(value);
        }
        set(selectedBandsBaseAtom, prevSelection);
    }
);
/**
 * Stores currently selected nodes
 */
export const selectedNodesAtom = atom((get) => {
    const nodes:string[] = [];
    get(selectedBandsAtom).forEach((selectedBand) => {
        const egoBundles = get(egoGraphBundlesAtom);
        // find the intersection that matches the selected band
        const containingBundle = Object.values(egoBundles).find((bundle) =>
            Object.keys(bundle.intersections).includes(selectedBand)
        );
        const bandNodes = containingBundle
            ? containingBundle.intersections[selectedBand]
            : [];
        nodes.push(...bandNodes);
    });
    get(selectedEgoGraphsAtom).forEach((selectedEgoGraph) => {
        const egoBundles = get(egoGraphBundlesAtom);
        const egoNodes = Object.values(egoBundles)
            .map((d) => d.egoGraphs)
            .flat()
            .filter((d) => d.centerNode.originalID === selectedEgoGraph)
            .map((d) => d.nodes.map((d) => d.originalID));
        nodes.push(...egoNodes.flat())
    });
    return [...new Set(nodes)];
});

