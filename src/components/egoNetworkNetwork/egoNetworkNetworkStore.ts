import { atom } from 'jotai';
import {
    egoNetworkNetwork,
    egoNetworkNetworkNode,
    egoNetworkNetworkRenderedEdge
} from '../../egoGraphSchema';
import { getMultiEgographBundleAtom } from '../../apiCalls.ts';
import * as d3 from 'd3';
import {
    egoGraphBundlesLayoutAtom,
    outerRadiusAtom
} from '../egograph/egoGraphBundleStore.ts';
import { egoNetworkNetworksOverviewAtom } from '../overview_component/egoNetworkNetworkOverviewStore.ts';

export const egoNetworkNetworkSizeAtom = atom({
    width: 1000,
    height: 1000,
    x: 0,
    y: 0
});

export const decollapseIDsArrayAtom = atom<string[][]>([]);
export const decollapsedSizeAtom = atom((get) => [
    get(outerRadiusAtom),
    300,
    300
]);

export const decollapseIDsAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set, id: string) => {
        const currentIdArray = get(decollapseIDsArrayAtom).slice();
        const nodeNeighbors = get(nodeNeighborsAtom);
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
            let idAdded = false;
            for (let i = currentIdArray.length - 1; i >= 0; i--) {
                const subArray = currentIdArray[i];
                if (
                    subArray.length < 3 &&
                    subArray.some((currid) =>
                        nodeNeighbors[currid].includes(id)
                    )
                ) {
                    currentIdArray[i].push(id);
                    idAdded = true;
                    break;
                }
            }
            if (!idAdded) {
                currentIdArray.push([id]);
            }
        }
        set(getMultiEgographBundleAtom, currentIdArray);
        set(decollapseIDsArrayAtom, currentIdArray);
    }
);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});

// This code creates a dictionary that maps nodes to their neighbors.
const nodeNeighborsAtom = atom((get) => {
    const neighborDict: { [key: string]: string[] } = {};
    get(egoNetworkNetworksAtom).edges.forEach((edge) => {
        neighborDict[edge.source] = neighborDict[edge.source] || [];
        neighborDict[edge.target] = neighborDict[edge.target] || [];
        neighborDict[edge.source].push(edge.target);
        neighborDict[edge.target].push(edge.source);
    });
    return neighborDict;
});
const egoNetworkNetworkDeepCopyAtom = atom<egoNetworkNetwork>((get) => {
    const copy = JSON.parse(JSON.stringify(get(egoNetworkNetworksAtom)));
    const nodeDict = {};
    copy.nodes.forEach((node) => (nodeDict[node.id] = node));
    copy.edges.forEach((edge) => {
        edge.source = nodeDict[edge.source];
        edge.target = nodeDict[edge.target];
    });
    return copy;
});

export const aggregateNetworkAtom = atom((get) => {
    const egoNetworkNetwork = get(egoNetworkNetworkDeepCopyAtom);
    const aggregateEgoNetworkNodeIDs = get(decollapseIDsAtom);
    const { outNodes, outEdges } = aggregateEgoNetworkNodes(
        egoNetworkNetwork.nodes,
        // FIXME egoNetworkNodes.edges is not defined in TS
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore ts2304
        egoNetworkNetwork.edges,
        aggregateEgoNetworkNodeIDs,
        get(decollapsedSizeAtom),
        get(scaleNodeSizeAtom)
    );
    // generate a deep copy for the force layout of outNodes and outEdges
    // const outEdgesInternal = JSON.parse(JSON.stringify(outEdges));
    const forceLayout = d3
        .forceSimulation(outNodes)
        .force('charge', d3.forceManyBody().strength(15))
        .force('center', d3.forceCenter(0, 0))
        .force(
            'collision',
            // FIXME d.radius is not defined in TS
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts2304
            d3.forceCollide().radius((d) => d.radius + 10)
        )
        .force(
            'link',
            d3
                .forceLink(outEdges)
                // FIXME d.id is not defined in TS
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                .id((d) => d.id)
                .distance(50)
        );
    forceLayout.stop();
    for (let i = 0; i < 1000; i++) {
        forceLayout.tick();
    }

    // reshape the edges to contain a x1, x2, y1, y2 coordinate
    // Create a dictionary of nodes for faster lookup
    const nodeDictionary = {};
    outNodes.forEach(node => {
        nodeDictionary[node.id] = node;
    });

    const edgesWithCoordinates = outEdges.map(edge => {
        const sourceNode = nodeDictionary[edge.source.id];
        const targetNode = nodeDictionary[edge.target.id];
        return {
            ...edge,
            source: edge.source.id,
            target: edge.target.id,
            x1: sourceNode.x,
            y1: sourceNode.y,
            x2: targetNode.x,
            y2: targetNode.y,
            opacity: 1
        };
    });


    return {
        nodes: outNodes,
        edges: edgesWithCoordinates
    };
});

function aggregateEgoNetworkNodes(
    egoNetworkNodesNodes: egoNetworkNetworkNode[],
    egoNetworkNetworkEdges: egoNetworkNetworkRenderedEdge[],
    aggregateNodeIDs: string[][],
    decollapsedSize: number[],
    radiusScale: d3.ScaleLinear<number, number>
): {
    outNodes: egoNetworkNetworkNode[];
    outEdges: egoNetworkNetworkRenderedEdge[];
} {
    const outNodes: egoNetworkNetworkNode[] = [];
    for (const node of egoNetworkNodesNodes) {
        // check if any of the arrays in aggregateNodeIDs includes node.id
        if (
            !aggregateNodeIDs.some((aggregate) => aggregate.includes(node.id))
        ) {
            outNodes.push({
                ...node,
                radius: Math.sqrt(radiusScale(node.size) / Math.PI),
                collapsed: true
            });
        }
    }
    const outEdges = egoNetworkNetworkEdges.filter((edge) => {
    if (!aggregateNodeIDs.flat().includes(edge.source.id)) {
        return !aggregateNodeIDs.flat().includes(edge.target.id);
    }
    return false;
});
    aggregateNodeIDs.forEach((aggregates) => {
        const aggregateID = aggregates.join(',');
        outNodes.push({
            id: aggregateID,
            name: aggregateID,
            radius: decollapsedSize[aggregates.length - 1],
            size: decollapsedSize[aggregates.length - 1],
            x: 0,
            y: 0,
            collapsed: false,
            neighbors: null
        });
    });
    return { outNodes: outNodes, outEdges: outEdges };
}

export const scaleNodeSizeAtom = atom((get) => {
    const allSizes = get(egoNetworkNetworksOverviewAtom).nodes.map(
        (d) => d.size
    );
    const max = d3.max(allSizes);
    const min = d3.min(allSizes);
    return d3
        .scaleLinear()
        .domain([min, max])
        .range([Math.PI * 5 ** 2, Math.PI * 50 ** 2]);
});
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
        opacity: number;
    }[] = [];
    if (
        Object.keys(egoLayouts).sort().toString() ===
            aggregateEgoNetworkNodeIDs.map((d) => d.join(',')).sort().toString() &&
        !Object.values(egoLayouts).includes(null)
    ) {
        const centerPositions: {
            [key: string]: { x: number; y: number; id: string };
        } = {};
        Object.values(egoLayouts)
            .flatMap((d) => d?.centers ?? [])
            .forEach((center) => (centerPositions[center.id] = center));
        const networkLayout = get(egoNetworkNetworksAtom);
        const nodeDict: { [key: string]: egoNetworkNetworkNode } = {};
        get(aggregateNetworkAtom).nodes.forEach(
            (node) => (nodeDict[node.id] = node)
        );
        networkLayout.edges.forEach((edge) => {
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
                        y2: nodeDict[edge.target].y, 
                        opacity: 1
                    });
                } else if (!isSourceAggregate && isTargetAggregate) {
                    const targetIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.target))
                        .indexOf(true);
                    interEdges.push({
                        opacity: 1,
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
                            opacity: 1,
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
