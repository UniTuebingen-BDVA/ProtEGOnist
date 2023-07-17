import {atom} from "jotai";
import {focusAtom} from "jotai-optics";
import {splitAtom} from "jotai/utils";
import {egoGraphLayout} from "./egolayout.ts";


export const graphAtom = atom<egoGraphLayout>({nodes: [], edges: [], maxradius: 0})
const nodeAtom = focusAtom(graphAtom, (optic) => optic.prop('nodes'))
export const nodesAtomsAtom = splitAtom(nodeAtom);
export const numEdgesMinMax= atom((get) => {
    const numEdges = get(graphAtom)?.nodes.filter(d => !d.isCenter).map(d => d.numEdges)
    if (numEdges && numEdges.length>0) {
        return [Math.min(...numEdges), Math.max(...numEdges)]
    } else return [0, 0]
})
