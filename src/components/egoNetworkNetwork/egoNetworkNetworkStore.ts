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

export const decollapseIDsArrayAtom = atom<string[][]>([[]]);

export const decollapseIDsAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set, id: string) => {
        if (id == '') {
            set(decollapseIDsArrayAtom, []);
        } else {
            const currentIdArray = get(decollapseIDsArrayAtom);
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
    console.log('Fourcelayouting');
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
            d3.forceCollide().radius((d) => d.size)
        );
    forceLayout.stop();
    for (let i = 0; i < 100; i++) {
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
    const outEdges: egoNetworkNetworkEdge[] = [];
    for (const node of egoNetworkNodesNodes) {
        // check if any of the arrays in aggregateNodeIDs includes node.id
        if (
            !aggregateNodeIDs.some((aggregate) => aggregate.includes(node.id))
        ) {
            outNodes.push({ ...node, collapsed: true });
        }
    }
    aggregateNodeIDs.forEach((aggregates, index) => {
        const aggregateID = aggregates.join(',');
        outNodes.push({
            id: aggregateID,
            name: aggregateID,
            size: 400,
            x: 0,
            y: 0,
            collapsed: false
        });

        // add all edges that do not have a source or target in aggregateNodeIDs to outEdges
        // instead of the edges that have a source or target in aggregateNodeIDs add a new edge to outEdges that targets the new node and has the sum of the weights of the edges as weight
        for (const edge of egoNetworkNetworkEdges) {
            if (
                !aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.source)
                ) &&
                !aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.target)
                )
            ) {
                outEdges.push(edge);
            } else {
                const weight = aggregates.reduce((acc, cur) => {
                    const currentEdge = egoNetworkNetworkEdges.find(
                        (edge) => edge.source === cur || edge.target === cur
                    );
                    const currentEdgeWeight = currentEdge
                        ? currentEdge.weight
                        : 0;
                    return acc + currentEdgeWeight;
                }, 0);
                //check which edges to add
                // no edges from aggregateNodeIDs to aggregateNodeIDs should be added
                // edges from aggregateNodeIDs to other nodes should be added
                // edges from other nodes to aggregateNodeIDs should be added

                const sourceInAggregate = aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.source)
                );
                const targetInAggregate = aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.target)
                );

                if (!sourceInAggregate || !targetInAggregate) {
                    const newEdge: egoNetworkNetworkEdge = {
                        source: sourceInAggregate ? aggregateID : edge.source,
                        target: targetInAggregate ? aggregateID : edge.target,
                        weight: weight
                    };
                    if (
                        outEdges.every(
                            (edge) =>
                                (edge.source !== newEdge.source ||
                                    edge.target !== newEdge.target) &&
                                (edge.source !== newEdge.target ||
                                    edge.target !== newEdge.source)
                        )
                    ) {
                        outEdges.push(newEdge);
                    }
                }
            }
        }
    });
    return { outNodes: outNodes, outEdges: outEdges };
}
