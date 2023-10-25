import { atom } from 'jotai';
import {
    egoNetworkNetwork,
    egoNetworkNetworkNode,
    egoNetworkNetworkRendered,
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
// indices stores indices in decollapsedIDsArray that are affected if the edges are selected for a bundle
const highlightedEdgesStoreAtom = atom<{ indices: number[]; ids: string[] }>({
    indices: [],
    ids: []
});
export const highlightedEdgesAtom = atom(
    (get) => get(highlightedEdgesStoreAtom),
    (get, set, ids: string[]) => {
        if (ids.length === 0) {
            set(highlightedEdgesStoreAtom, { indices: [], ids: [] });
        } else {
            const currentIdArray = get(decollapseIDsArrayAtom).slice();
            const aggregateIndex = (id: string) => {
                let index = -1;
                for (let i = 0; i < currentIdArray.length; i++) {
                    if (currentIdArray[i].includes(id)) {
                        index = i;
                        break;
                    }
                }
                return index;
            };
            const nodeDict: { [key: string]: egoNetworkNetworkNode } = {};
            get(aggregateNetworkAtom).nodes.forEach(
                (node) => (nodeDict[node.id] = node)
            );
            const sourceIndex = aggregateIndex(ids[0]);
            const targetIndex = aggregateIndex(ids[1]);
            if (sourceIndex !== -1 && currentIdArray[sourceIndex].length < 3) {
                // case: add to existing bundle
                if (targetIndex === -1) {
                    set(highlightedEdgesStoreAtom, {
                        indices: [sourceIndex],
                        ids: [...currentIdArray[sourceIndex], ids[1]]
                    });
                    //case: merge two bundles
                } else if (
                    sourceIndex !== -1 &&
                    targetIndex !== -1 &&
                    currentIdArray[sourceIndex].length +
                        currentIdArray[targetIndex].length <=
                        3
                ) {
                    set(highlightedEdgesStoreAtom, {
                        indices: [sourceIndex, targetIndex],
                        ids: [
                            ...currentIdArray[targetIndex],
                            ...currentIdArray[sourceIndex]
                        ]
                    });
                }
            } else {
                // case: add to existing bundles
                if (
                    sourceIndex === -1 &&
                    targetIndex !== -1 &&
                    currentIdArray[targetIndex].length < 3
                ) {
                    set(highlightedEdgesStoreAtom, {
                        indices: [targetIndex],
                        ids: [...currentIdArray[targetIndex], ids[0]]
                    });
                    // case create new bundle from two nodes
                } else if (sourceIndex === -1 && targetIndex === -1) {
                    set(highlightedEdgesStoreAtom, { indices: [], ids: ids });
                }
            }
        }
    }
);

export const updateDecollapseIdsAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set, ids:string[]) => {
        const decollapseIDs=get(decollapseIDsArrayAtom).slice();
        for(let i=decollapseIDs.length-1;i>=0;i--){
            for(let j=decollapseIDs[i].length-1;j>=0;j--){
                if(!ids.includes(decollapseIDs[i][j])){
                    if(decollapseIDs[i].length===1){
                        decollapseIDs.splice(i,1);
                    }else{
                        decollapseIDs[i].splice(j,1);
                    }
                }
            }
        }
        set(getMultiEgographBundleAtom,decollapseIDs);
    }
);
export const decollapseEdgeAtom = atom(
    (get) => get(decollapseIDsArrayAtom),
    (get, set) => {
        const currentIdArray = get(decollapseIDsArrayAtom).slice();
        const highlightedEdges = get(highlightedEdgesAtom);
        if (highlightedEdges.ids.length > 0) {
            // case: two bundles are merged
            if (highlightedEdges.indices.length === 2) {
                currentIdArray[highlightedEdges.indices[0]] =
                    highlightedEdges.ids;
                currentIdArray.splice(highlightedEdges.indices[1], 1);
                // case: node is added to bundle
            } else if (highlightedEdges.indices.length === 1) {
                currentIdArray[highlightedEdges.indices[0]] =
                    highlightedEdges.ids;
                // case: new bundle created
            } else {
                currentIdArray.push(highlightedEdges.ids);
            }
            set(getMultiEgographBundleAtom, currentIdArray);
        }
    }
);
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
            currentIdArray.push([id]);
        }
        set(getMultiEgographBundleAtom, currentIdArray);
    }
);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});

const egoNetworkNetworkDeepCopyAtom = atom<egoNetworkNetworkRendered>((get) => {
    const copy: egoNetworkNetwork = JSON.parse(
        JSON.stringify(get(egoNetworkNetworksAtom))
    );
    const nodeDict: { [key: string]: egoNetworkNetworkNode } = {};
    copy.nodes.forEach((node) => (nodeDict[node.id] = node));
    const renderedNetwork: egoNetworkNetworkRendered = { nodes: [], edges: [] };
    renderedNetwork.nodes = copy.nodes.map((node) => {
        return { ...node, x: 0, y: 0, vx: 0, vy: 0 };
    });
    renderedNetwork.edges = copy.edges.map((edge) => {
        return {
            ...edge,
            source: nodeDict[edge.source],
            target: nodeDict[edge.target],
            visible: true
        };
    });
    return renderedNetwork;
});

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
    // generate a deep copy for the force layout of outNodes and outEdges
    // const outEdgesInternal = JSON.parse(JSON.stringify(outEdges));
    d3.forceSimulation(outNodes)
        .force('center', d3.forceCenter(0, 0))
        .force(
            'charge',
            d3.forceManyBody().strength(() => -10)
        )
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d: egoNetworkNetworkNode) => d.id)
                .distance((d) => 500 * (1 - d.weight))
        )
        .force(
            'collision',
            d3.forceCollide().radius((d: egoNetworkNetworkNode) => d.radius + 5)
        )
        .stop()
        .tick(100);

    // reshape the edges to contain a x1, x2, y1, y2 coordinate
    // Create a dictionary of nodes for faster lookup

    const nodeDictionary: { [key: string]: egoNetworkNetworkNode } = {};
    outNodes.forEach((node) => {
        nodeDictionary[node.id] = node;
    });

    const edgesWithCoordinates = outEdges
        .map((edge) => {
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
        })
        .filter((d) => d.visible);
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
    const nodeDict: { [key: string]: egoNetworkNetworkNode } = {};
    for (const node of egoNetworkNodesNodes) {
        // check if any of the arrays in aggregateNodeIDs includes node.id
        if (
            !aggregateNodeIDs.some((aggregate) => aggregate.includes(node.id))
        ) {
            nodeDict[node.id] = {
                ...node,
                radius: Math.sqrt(radiusScale(node.size) / Math.PI),
                collapsed: true
            };
        }
    }
    aggregateNodeIDs.forEach((aggregates) => {
        const aggregateID = aggregates.join(',');
        nodeDict[aggregateID] = {
            id: aggregateID,
            name: aggregateID,
            radius: decollapsedSize[aggregates.length - 1],
            size: decollapsedSize[aggregates.length - 1],
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            collapsed: false,
            neighbors: null
        };
    });
    const outEdges: egoNetworkNetworkRenderedEdge[] = [];
    const aggregatesDict: { [key: string]: egoNetworkNetworkRenderedEdge[] } =
        {};
    const aggregateIndex = (id: string) => {
        let index = -1;
        for (let i = 0; i < aggregateNodeIDs.length; i++) {
            if (aggregateNodeIDs[i].includes(id)) {
                index = i;
                break;
            }
        }
        return index;
    };
    egoNetworkNetworkEdges.forEach((edge) => {
        const sourceIndex = aggregateIndex(edge.source.id);
        const targetIndex = aggregateIndex(edge.target.id);
        let fullID = '';
        if (sourceIndex === -1) {
            if (targetIndex === -1) {
                outEdges.push(edge);
            } else {
                fullID = [aggregateNodeIDs[targetIndex], edge.source.id].join(
                    '_'
                );
            }
        } else {
            if (targetIndex === -1) {
                fullID = [aggregateNodeIDs[sourceIndex], edge.target.id].join(
                    '_'
                );
            } else if (targetIndex !== sourceIndex) {
                fullID = [
                    aggregateNodeIDs[sourceIndex],
                    aggregateNodeIDs[targetIndex]
                ]
                    .sort()
                    .join('_');
            }
        }
        if (fullID != '') {
            if (!Object.keys(aggregatesDict).includes(fullID)) {
                aggregatesDict[fullID] = [];
            }
            aggregatesDict[fullID].push(edge);
        }
    });
    outEdges.push(
        ...Object.keys(aggregatesDict).map((fullID) => {
            const sourceTarget = fullID.split('_');
            return {
                source: nodeDict[sourceTarget[0]],
                target: nodeDict[sourceTarget[1]],
                weight:
                    aggregatesDict[fullID]
                        .map((d) => d.weight)
                        .reduce((a, b) => a + b, 0) /
                    aggregatesDict[fullID].length,
                visible: false
            };
        })
    );
    //outEdges= outEdges.sort((a,b)=>a.weight-b.weight)
    const outNodes = Object.values(nodeDict).sort((a, b) => {
        if (a.id < b.id) {
            return -1;
        } else {
            return 1;
        }
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
    const networkLayout = get(egoNetworkNetworksAtom);
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
            aggregateEgoNetworkNodeIDs
                .map((d) => d.join(','))
                .sort()
                .toString() &&
        !Object.values(egoLayouts).includes(null)
    ) {
        const centerPositions: {
            [key: string]: { x: number; y: number; id: string };
        } = {};
        Object.values(egoLayouts)
            .flatMap((d) => d?.centers ?? [])
            .forEach((center) => (centerPositions[center.id] = center));
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
