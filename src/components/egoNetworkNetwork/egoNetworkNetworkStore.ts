import { atom } from 'jotai';
import {
    egoNetworkNetwork,
    egoNetworkNetworkEdge,
    egoNetworkNetworkNode
} from '../../egoGraphSchema';
import { getMultiEgographBundleAtom } from '../../apiCalls.ts';
import * as d3 from 'd3';
import {
    egoGraphBundlesLayoutAtom,
    outerRadiusAtom
} from '../egograph/egoGraphBundleStore.ts';

export const egoNetworkNetworkSizeAtom = atom({
    width: 1000,
    height: 1000,
    x: 0,
    y: 0
});

export const decollapseIDsArrayAtom = atom<string[][]>([]);
export const decollapsedSizeAtom = atom((get) => [
    get(outerRadiusAtom),
    200,
    200
]);
export const decollapseIDsAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set, id: string) => {
        const currentIdArray = get(decollapseIDsArrayAtom).slice();
        const idIndex = currentIdArray
            .map((bundleIds) => bundleIds.includes(id))
            .indexOf(true);
        if (idIndex !== -1) {
            const subArray = currentIdArray[idIndex];
            if (subArray.length > 1) {
                subArray.splice(currentIdArray[idIndex].indexOf(id), 1);
                currentIdArray[idIndex] = subArray;
            } else currentIdArray.splice(idIndex, 1);
        } else {
            if (currentIdArray.length === 0) {
                currentIdArray.push([]);
            }
            if (currentIdArray[currentIdArray.length - 1].length < 3) {
                currentIdArray[currentIdArray.length - 1].push(id);
            } else {
                currentIdArray.push([id]);
            }
        }
        set(decollapseIDsArrayAtom, currentIdArray);
        set(getMultiEgographBundleAtom, currentIdArray);
    }
);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});
const egoNetworkNetworkDeepCopyAtom = atom<egoNetworkNetwork>((get) =>
    JSON.parse(JSON.stringify(get(egoNetworkNetworksAtom)))
);

export const aggregateNetworkAtom = atom((get) => {
    const egoNetworkNetwork = get(egoNetworkNetworkDeepCopyAtom);
    const aggregateEgoNetworkNodeIDs = get(decollapseIDsAtom);
    const { outNodes, outEdges } = aggregateEgoNetworkNodes(
        egoNetworkNetwork.nodes,
        egoNetworkNetwork.edges,
        aggregateEgoNetworkNodeIDs,
        get(decollapsedSizeAtom)
    );
    console.log('Relayout');
    // generate a deep copy for the force layout of outNodes and outEdges
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
    return {
        nodes: outNodes,
        edges: outEdges
    };
});

function aggregateEgoNetworkNodes(
    egoNetworkNodesNodes: egoNetworkNetworkNode[],
    egoNetworkNetworkEdges: egoNetworkNetworkEdge[],
    aggregateNodeIDs: string[][],
    decollapsedSize: number[]
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
        (edge) =>
            !aggregateNodeIDs.flat().includes(edge.source.id) &&
            !aggregateNodeIDs.flat().includes(edge.target.id)
    );

    aggregateNodeIDs.forEach((aggregates) => {
        const aggregateID = aggregates.join(',');
        outNodes.push({
            id: aggregateID,
            name: aggregateID,
            size: decollapsedSize[aggregates.length - 1],
            x: 0,
            y: 0,
            collapsed: false
        });
    });
    return { outNodes: outNodes, outEdges: outEdges };
}

export const interEdgesAtom = atom((get) => {
    const aggregateEgoNetworkNodeIDs = get(decollapseIDsAtom);
    const egoLayouts = get(egoGraphBundlesLayoutAtom);
    const decollapsedSize = get(decollapsedSizeAtom);
    const interEdges: {
        source: string;
        target: string;
        x1: number;
        x2: number;
        y1: number;
        y2: number;
        weight: number;
    }[] = [];
    if (
        Object.keys(egoLayouts).toString() ===
            aggregateEgoNetworkNodeIDs.map((d) => d.join(',')).toString() &&
        !Object.values(egoLayouts).includes(null)
    ) {
        const centerPositions: {
            [key: string]: { x: number; y: number; id: string };
        } = {};
        Object.values(egoLayouts)
            .map((d) => d?.centers)
            .flat()
            .forEach((center) => (centerPositions[center.id] = center));
        const networkLayout = get(egoNetworkNetworksAtom);
        const nodeDict: { [key: string]: egoNetworkNetworkNode } = {};
        get(aggregateNetworkAtom).nodes.forEach(
            (node) => (nodeDict[node.id] = node)
        );
        networkLayout.edges.forEach((edge: egoNetworkNetworkEdge) => {
            if (
                aggregateEgoNetworkNodeIDs.flat().includes(edge.source) ||
                aggregateEgoNetworkNodeIDs.flat().includes(edge.target)
            ) {
                const isSourceAggregate = aggregateEgoNetworkNodeIDs
                    .flat()
                    .includes(edge.source);
                const isTargetAggregate = aggregateEgoNetworkNodeIDs
                    .flat()
                    .includes(edge.target);
                if (isSourceAggregate && !isTargetAggregate) {
                    const sourceIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.source))
                        .indexOf(true);
                    interEdges.push({
                        source: edge.source,
                        target: edge.target,
                        weight: edge.weight,
                        x1:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[sourceIndex].join(
                                    ','
                                )
                            ].x +
                            centerPositions[edge.source].x -
                            decollapsedSize[
                                aggregateEgoNetworkNodeIDs[sourceIndex].length -
                                    1
                            ] /
                                2,
                        y1:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[sourceIndex].join(
                                    ','
                                )
                            ].y +
                            centerPositions[edge.source].y -
                            decollapsedSize[
                                aggregateEgoNetworkNodeIDs[sourceIndex].length -
                                    1
                            ] /
                                2,
                        x2: nodeDict[edge.target].x,
                        y2: nodeDict[edge.target].y
                    });
                } else if (!isSourceAggregate && isTargetAggregate) {
                    const targetIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.target))
                        .indexOf(true);
                    interEdges.push({
                        source: edge.source,
                        target: edge.target,
                        weight: edge.weight,
                        x1: nodeDict[edge.source].x,
                        y1: nodeDict[edge.source].y,
                        x2:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[targetIndex].join(
                                    ','
                                )
                            ].x +
                            centerPositions[edge.target].x -
                            decollapsedSize[
                                aggregateEgoNetworkNodeIDs[targetIndex].length -
                                    1
                            ] /
                                2,
                        y2:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[targetIndex].join(
                                    ','
                                )
                            ].y +
                            centerPositions[edge.target].y -
                            decollapsedSize[
                                aggregateEgoNetworkNodeIDs[targetIndex].length -
                                    1
                            ] /
                                2
                    });
                } else {
                    const sourceIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.source))
                        .indexOf(true);
                    const targetIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.target))
                        .indexOf(true);
                    if (sourceIndex !== targetIndex) {
                        interEdges.push({
                            source: edge.source,
                            target: edge.target,
                            weight: edge.weight,
                            x1:
                                nodeDict[
                                    aggregateEgoNetworkNodeIDs[
                                        sourceIndex
                                    ].join(',')
                                ].x +
                                centerPositions[edge.source].x -
                                decollapsedSize[
                                    aggregateEgoNetworkNodeIDs[sourceIndex]
                                        .length - 1
                                ] /
                                    2,
                            y1:
                                nodeDict[
                                    aggregateEgoNetworkNodeIDs[
                                        sourceIndex
                                    ].join(',')
                                ].y +
                                centerPositions[edge.source].y -
                                decollapsedSize[
                                    aggregateEgoNetworkNodeIDs[sourceIndex]
                                        .length - 1
                                ] /
                                    2,
                            x2:
                                nodeDict[
                                    aggregateEgoNetworkNodeIDs[
                                        targetIndex
                                    ].join(',')
                                ].x +
                                centerPositions[edge.target].x -
                                decollapsedSize[
                                    aggregateEgoNetworkNodeIDs[targetIndex]
                                        .length - 1
                                ] /
                                    2,
                            y2:
                                nodeDict[
                                    aggregateEgoNetworkNodeIDs[
                                        targetIndex
                                    ].join(',')
                                ].y +
                                centerPositions[edge.target].y -
                                decollapsedSize[
                                    aggregateEgoNetworkNodeIDs[targetIndex]
                                        .length - 1
                                ] /
                                    2
                        });
                    }
                }
            }
        });
    }
    return interEdges;
});
