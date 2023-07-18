import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import { egoGraphLayout } from './egolayout.ts';
import * as d3 from 'd3';
import { graphSizeAtom, maxRadiusAtom } from './networkStore.ts';

export const graphAtom = atom<egoGraphLayout>({
    nodes: [],
    edges: [],
    maxradius: 0
});
export const collapsedAtom = atom(true);
const nodeAtom = focusAtom(graphAtom, (optic) => optic.prop('nodes'));
export const nodesAtomsAtom = splitAtom(nodeAtom);
const numEdgesMinMax = atom((get) => {
    const numEdges = get(graphAtom)
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
    console.log(get(maxRadiusAtom),get(graphAtom).maxradius)
    return get(maxRadiusAtom) < get(graphAtom).maxradius
        ? get(maxRadiusAtom)
        : get(graphAtom).maxradius;
});
export const centerPointAtom = atom((get) => {
    return {
        x: get(graphSizeAtom) / 2 - get(nodeRadiusAtom),
        y: get(graphSizeAtom) / 2 - get(nodeRadiusAtom)
    };
});
