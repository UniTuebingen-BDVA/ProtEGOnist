import { atom } from 'jotai';
import {
    egoNetworkNetwork,
    egoNetworkNetworkEdge,
    egoNetworkNetworkNode
} from '../../egoGraphSchema';
import { getMultiEgographBundleAtom } from '../../apiCalls.ts';
import * as d3 from 'd3';

export const egoNetworkNetworkSizeAtom = atom({
    width: 1000,
    height: 1000,
    x: 0,
    y: 0
});

export const decollapseIDsArrayAtom = atom<string[][]>([]);

export const decollapseIDsAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set, id: string) => {
        if (id == '') {
            set(decollapseIDsArrayAtom, []);
        } else {
            const currentIdArray = get(decollapseIDsArrayAtom).slice();
            if (currentIdArray.length === 0) {
                currentIdArray.push([]);
            }
            if (currentIdArray[currentIdArray.length - 1].length < 3) {
                currentIdArray[currentIdArray.length - 1].push(id);
            } else {
                currentIdArray.push([id]);
            }
            set(decollapseIDsArrayAtom, currentIdArray);
            set(getMultiEgographBundleAtom, currentIdArray);
        }
    }
);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});

export const aggregateNetworkAtom = atom((get) => {
    const egoNetworkNetwork = get(egoNetworkNetworksAtom);
    const aggregateEgoNetworkNodeIDs = get(decollapseIDsAtom);
    const { outNodes, outEdges } = aggregateEgoNetworkNodes(
        egoNetworkNetwork.nodes,
        egoNetworkNetwork.edges,
        aggregateEgoNetworkNodeIDs
    );
    console.log('Relayout');
    // generate a deep copy for the force layout of outNodes and outEdges
    // const outNodesInternal = JSON.parse(JSON.stringify(outNodes));
    // const outEdgesInternal = JSON.parse(JSON.stringify(outEdges));
    // console.log('internalNodes', outNodesInternal);
    // console.log('internalEdges', outEdgesInternal);
    const forceLayout = d3
        .forceSimulation(outNodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d) => d.id)
                .distance(50)
        )
        .force('center', d3.forceCenter(0, 0))
        .force(
            'collision',
            d3.forceCollide().radius((d) => d.size + 10)
        );
    forceLayout.stop();
    for (let i = 0; i < 1000; i++) {
        forceLayout.tick();
    }
    return { nodes: outNodes, edges: outEdges };
});

function aggregateEgoNetworkNodes(
    egoNetworkNodesNodes: egoNetworkNetworkNode[],
    egoNetworkNetworkEdges: egoNetworkNetworkEdge[],
    aggregateNodeIDs: string[][]
): { outNodes: egoNetworkNetworkNode[]; outEdges: egoNetworkNetworkEdge[] } {
    const outNodes: egoNetworkNetworkNode[] = [];
    for (const node of egoNetworkNodesNodes) {
        // check if any of the arrays in aggregateNodeIDs includes node.id
        if (
            !aggregateNodeIDs.some((aggregate) => aggregate.includes(node.id))
        ) {
            outNodes.push({ ...node, collapsed: true });
        }
    }
    const outEdges = egoNetworkNetworkEdges.filter(
        (d) =>
            !aggregateNodeIDs.flat().includes(d.source.id) &&
            !aggregateNodeIDs.flat().includes(d.target.id)
    );

    aggregateNodeIDs.forEach((aggregates) => {
        const aggregateID = aggregates.join(',');
        outNodes.push({
            id: aggregateID,
            name: aggregateID,
            size: 400,
            x: 0,
            y: 0,
            collapsed: false
        });
    });
    return { outNodes: outNodes, outEdges: outEdges };
}
