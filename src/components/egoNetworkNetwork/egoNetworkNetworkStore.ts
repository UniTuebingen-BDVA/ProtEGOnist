import { atom } from 'jotai';
import {
    egoNetworkNetwork,
    egoNetworkNetworkEdge,
    egoNetworkNetworkNode,
    egoNetworkNetworkRenderedEdge
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
        set(decollapseIDsArrayAtom, currentIdArray);
        set(getMultiEgographBundleAtom, currentIdArray);
    }
);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});
const nodeNeighborsAtom = atom((get) => {
    const neighborDict: { [key: string]: string[] } = {};
    get(egoNetworkNetworksAtom).edges.forEach((edge) => {
        if (!Object.keys(neighborDict).includes(edge.source)) {
            neighborDict[edge.source] = [edge.target];
        } else {
            neighborDict[edge.source].push(edge.target);
        }
        if (!Object.keys(neighborDict).includes(edge.target)) {
            neighborDict[edge.target] = [edge.source];
        } else {
            neighborDict[edge.target].push(edge.source);
        }
    });
    return neighborDict;
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
        get(decollapsedSizeAtom),
        get(scaleNodeSizeAtom)
    );
    console.log('Relayout');
    // generate a deep copy for the force layout of outNodes and outEdges
    // const outEdgesInternal = JSON.parse(JSON.stringify(outEdges));
    // console.log('internalNodes', outNodesInternal);
    // console.log('internalEdges', outEdgesInternal);
    const forceLayout = d3
        .forceSimulation(outNodes)
        .force('charge', d3.forceManyBody().strength(-50))
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
            d3.forceCollide().radius((d) => d.radius + 10)
        );
    forceLayout.stop();
    for (let i = 0; i < 1000; i++) {
        forceLayout.tick();
    }

    // reshape the edges to contain a x1, x2, y1, y2 coordinate
    const edgesWithCoordinates = outEdges.map((edge) => {
        const source = outNodes.find((node) => node.id === edge.source.id);
        const target = outNodes.find((node) => node.id === edge.target.id);
        return {
            ...edge,
            source: edge.source.id,
            target: edge.target.id,
            x1: source.x,
            y1: source.y,
            x2: target.x,
            y2: target.y
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
            radius: decollapsedSize[aggregates.length - 1],
            size: decollapsedSize[aggregates.length - 1],
            x: 0,
            y: 0,
            collapsed: false
        });
    });
    return { outNodes: outNodes, outEdges: outEdges };
}

export const scaleNodeSizeAtom = atom((get) => {
    const allSizes = get(egoNetworkNetworksAtom).nodes.map((d) => d.size);
    const max = d3.max(allSizes);
    const min = d3.min(allSizes);
    return d3
        .scaleLinear()
        .domain([min, max])
        .range([Math.PI * 5 ** 2, Math.PI * 150 ** 2]);
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
