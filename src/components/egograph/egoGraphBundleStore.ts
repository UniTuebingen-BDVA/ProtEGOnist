import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';
import { aggregateNetworkAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';

export const egoGraphBundlesLayoutAtom = atom<{
    [key: string]: egoGraphLayout | null;
}>({});

export const bundleTranslateAtom = atom<{
    [key: string]: { x: number; y: number };
}>({});
export const interEdgesAtom = atom((get) => {
    const interEdges = {};
    const centerPositions = {};
    const egolayouts = get(egoGraphBundlesLayoutAtom);
    const networkLayout = get(aggregateNetworkAtom);
    Object.values(egolayouts).forEach(
        (layout) =>
            layout?.centers.forEach(
                (center) => (centerPositions[center.id] = center)
            )
    );
    networkLayout.bundleNetworkEdges.forEach((edge) => {
        const isEgoSource = Object.keys(egolayouts).includes(edge.source.id);
        const isEgoTarget = Object.keys(egolayouts).includes(edge.target.id);
        if (isEgoSource) {
            if(isEgoTarget){

            }else{

            }
        } else if(isEgoTarget){

        } else{

        }
    });
    return centerPositions;
});

export const innerRadiusAtom = atom(50);
export const outerRadiusAtom = atom(70);
export const maxRadiusAtom = atom(5);
