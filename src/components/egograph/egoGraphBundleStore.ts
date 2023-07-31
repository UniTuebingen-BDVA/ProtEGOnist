import { atom } from 'jotai';
import { bundleGroupSizeAtom, graphSVGSizeAtom, maxRadiusAtom } from './networkStore';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import * as d3 from 'd3';
import { calculateLayout, egoGraphLayout } from './egolayout.ts';
import { egoGraph } from '../../egoGraphSchema.ts';

const bundleSizeAtom = atom(1);
export const egoGraphBundleDataAtom = atom<{
    egoGraphs: egoGraph[];
    intersections: { [key: string]: string[] };
} | null>(null);
const egoGraphBundleDefaultAtom = atom((get) => {
    const data = get(egoGraphBundleDataAtom);
    if (data === null) {
        return { edges: [], nodes: [], identityEdges: [], maxRadius: 0 };
    } else {
        return calculateLayout(
            data.egoGraphs,
            data.intersections,
            get(bundleGroupSizeAtom).height,
            get(bundleGroupSizeAtom).width,
            50,
            70
        );
    }
});
const egoGraphBundleOverwrittenAtom = atom(null);
export const egoGraphBundleAtom = atom<egoGraphLayout>(
    (get) => {
        return (
            get(egoGraphBundleOverwrittenAtom) || get(egoGraphBundleDefaultAtom)
        );
    },
    (_get, set, action) => set(egoGraphBundleOverwrittenAtom, action)
);

const nodeAtom = focusAtom(egoGraphBundleAtom, (optic) => optic.prop('nodes'));
export const nodesAtomsAtom = splitAtom(nodeAtom);
const numEdgesMinMax = atom((get) => {
    const numEdges = get(egoGraphBundleAtom)
        ?.nodes.filter((d) => !d.isCenter)
        .map((d) => d.numEdges);
    if (numEdges && numEdges.length > 0) {
        return [Math.min(...numEdges), Math.max(...numEdges)];
    } else return [0, 0];
});
export const colorScaleAtom = atom((get) => {
    return d3
        .scaleLinear<string, number>()
        .range(['white', 'black'])
        .domain(get(numEdgesMinMax));
});
export const nodeRadiusAtom = atom((get) => {
    return get(maxRadiusAtom) < get(egoGraphBundleAtom).maxradius
        ? get(maxRadiusAtom)
        : get(egoGraphBundleAtom).maxradius;
});
export const circlePortionAtom = atom((get) => 1 / get(bundleSizeAtom));
