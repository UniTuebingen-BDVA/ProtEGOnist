import { atom } from 'jotai';
import {
    egoGraph,
    egoNetworkNetwork,
    egoNetworkNetworkNode,
    egoNetworkNetworkRendered,
    egoNetworkNetworkRenderedEdge
} from '../../egoGraphSchema';
import { getMultiEgographBundleAtom } from '../../apiCalls.ts';
import * as d3 from 'd3';
import {
    egoGraphBundlesLayoutAtom,
    sortNodesBy
} from '../egograph/egoGraphBundleStore.ts';
import { egoNetworkNetworksOverviewAtom } from '../overview_component/egoNetworkNetworkOverviewStore.ts';
import { calculateLayout } from '../egograph/egolayout.ts';

// stores egoGraphs and their intersections
export const egoGraphBundlesAtom = atom<{
    [id: string]: {
        egoGraphs: egoGraph[];
        intersections: { [key: string]: string[] };
    };
}>({});

export const updateEgoGraphBundleAtom = atom(
    null,
    (
        get,
        set,
        updater: {
            ids: string[];
            bundles: {
                [id: string]: {
                    egoGraphs: egoGraph[];
                    intersections: { [key: string]: string[] };
                };
            };
        }
    ) => {
        let bundles = get(egoGraphBundlesAtom);
        let layouts = structuredClone(get(egoGraphBundlesLayoutAtom));
        updater.ids.forEach((id) => {
            const { [id]: _bundle, ...restL } = layouts;
            layouts = restL;
            const { [id]: _layout, ...restB } = bundles;
            bundles = restB;
        });
        bundles = { ...bundles, ...updater.bundles };
        Object.entries(updater.bundles).forEach(([key, value]) => {
            layouts = {
                ...layouts,
                [key]: calculateLayout(
                    value.egoGraphs,
                    value.intersections,
                    get(decollapseModeAtom),
                    get(sortNodesBy)
                )
            };
        });
        set(egoGraphBundlesAtom, bundles);
        set(egoGraphBundlesLayoutAtom, layouts);
    }
);

const decollapseModeStoreAtom = atom('shared');
export const decollapseModeAtom = atom(
    (get) => get(decollapseModeStoreAtom),
    (get, set, value: string) => {
        const bundles = get(egoGraphBundlesAtom);
        const newLayouts = {};
        Object.entries(bundles).forEach(([id, bundle]) => {
            newLayouts[id] = calculateLayout(
                bundle.egoGraphs,
                bundle.intersections,
                value,
                get(sortNodesBy)
            );
        });
        set(decollapseModeStoreAtom, value);
        set(egoGraphBundlesLayoutAtom, newLayouts);
        // TODO: Show loading spinner when layout is recalculated
    }
);
export const decollapseIDsAtom = atom<string[][]>((get) =>
    Object.keys(get(egoGraphBundlesLayoutAtom)).map((d) => d.split(','))
);
export const decollapsedSizeAtom = atom((get) => {
    const layouts = get(egoGraphBundlesLayoutAtom);
    const decollapsedSizes: { [key: string]: number } = {};
    Object.entries(layouts).forEach(([key, layout]) => {
        if (layout) {
            decollapsedSizes[key] = layout.decollapsedSize;
        } else {
            decollapsedSizes[key] = 0;
        }
    });
    return decollapsedSizes;
});
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
            const currentIdArray = get(decollapseIDsAtom).slice();
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
/**
 * Write-only atom for updating decollapse IDs when a node is deleted from the egoNetworkNetwork
 */
export const updateDecollapseIdsAtom = atom(null, (get, set, ids: string[]) => {
    const decollapseIDs = get(decollapseIDsAtom).slice();
    for (let i = decollapseIDs.length - 1; i >= 0; i--) {
        for (let j = decollapseIDs[i].length - 1; j >= 0; j--) {
            if (!ids.includes(decollapseIDs[i][j])) {
                if (decollapseIDs[i].length === 1) {
                    decollapseIDs.splice(i, 1);
                } else {
                    decollapseIDs[i].splice(j, 1);
                }
            }
        }
    }
    set(getMultiEgographBundleAtom, decollapseIDs);
});
/**
 * write-only atom for decollapsing both nodes attached to an edge
 */
export const decollapseEdgeAtom = atom(null, (get, set) => {
    const currentIdArray = get(decollapseIDsAtom).slice();
    const highlightedEdges = get(highlightedEdgesAtom);
    if (highlightedEdges.ids.length > 0) {
        // case: two bundles are merged
        if (highlightedEdges.indices.length === 2) {
            currentIdArray[highlightedEdges.indices[0]] = highlightedEdges.ids;
            currentIdArray.splice(highlightedEdges.indices[1], 1);
            // case: node is added to bundle
        } else if (highlightedEdges.indices.length === 1) {
            currentIdArray[highlightedEdges.indices[0]] = highlightedEdges.ids;
            // case: new bundle created
        } else {
            currentIdArray.push(highlightedEdges.ids);
        }
        set(getMultiEgographBundleAtom, currentIdArray);
    }
});

/**
 * Read only aton to check if node is collapsed
 */
export const isNodeCollapsedAtom = atom((get) => (id: string) => {
    const currentIdArray = get(decollapseIDsAtom).slice();
    return currentIdArray.some((bundleIds) => bundleIds.includes(id));
});

/**
 * Write-only atom for decollapsing a single node
 */
export const decollapseNodeAtom = atom(null, (get, set, id: string) => {
    const currentIdArray = get(decollapseIDsAtom).slice();
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
});

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});

const egoNetworkNetworkDeepCopyAtom = atom<egoNetworkNetworkRendered>((get) => {
    const copy: egoNetworkNetwork = structuredClone(
        get(egoNetworkNetworksAtom)
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
            d3
                .forceCollide()
                .radius((d: egoNetworkNetworkNode) => d.radius + 20)
        )
        .stop()
        .tick(500);

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
    decollapsedSize: { [key: string]: number },
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
            radius: decollapsedSize[aggregateID],
            size: decollapsedSize[aggregateID],
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
    const decollapsedSize = get(decollapsedSizeAtom);
    //find max value in the decollapsedSize dictionary
    const maxDecollapsed: number = d3.max(Object.values(decollapsedSize));
    const maxRadius: number =
        maxDecollapsed === undefined ? 150 : maxDecollapsed;
    const allSizes = get(egoNetworkNetworksOverviewAtom).nodes.map(
        (d) => d.size
    );
    const max = d3.max(allSizes);
    const min = d3.min(allSizes);
    return d3
        .scaleLinear()
        .domain([min, max])
        .range([
            Math.PI * (maxRadius / 30) ** 2,
            Math.PI * (maxRadius / 3) ** 2
        ]);
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
                    const aggregateID =
                        aggregateEgoNetworkNodeIDs[sourceIndex].join(',');
                    interEdges.push({
                        source: edge.source,
                        target: edge.target,
                        weight: edge.weight,
                        x1:
                            nodeDict[aggregateID].x +
                            centerPositions[edge.source].x -
                            decollapsedSize[aggregateID] / 2,
                        y1:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[sourceIndex].join(
                                    ','
                                )
                            ].y +
                            centerPositions[edge.source].y -
                            decollapsedSize[aggregateID] / 2,
                        x2: nodeDict[edge.target].x,
                        y2: nodeDict[edge.target].y,
                        opacity: 1
                    });
                } else if (!isSourceAggregate && isTargetAggregate) {
                    const targetIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.target))
                        .indexOf(true);
                    const aggregateID =
                        aggregateEgoNetworkNodeIDs[targetIndex].join(',');
                    interEdges.push({
                        opacity: 1,
                        source: edge.source,
                        target: edge.target,
                        weight: edge.weight,
                        x1: nodeDict[edge.source].x,
                        y1: nodeDict[edge.source].y,
                        x2:
                            nodeDict[aggregateID].x +
                            centerPositions[edge.target].x -
                            decollapsedSize[aggregateID] / 2,
                        y2:
                            nodeDict[
                                aggregateEgoNetworkNodeIDs[targetIndex].join(
                                    ','
                                )
                            ].y +
                            centerPositions[edge.target].y -
                            decollapsedSize[aggregateID] / 2
                    });
                } else {
                    const sourceIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.source))
                        .indexOf(true);
                    const targetIndex = aggregateEgoNetworkNodeIDs
                        .map((ids) => ids.includes(edge.target))
                        .indexOf(true);
                    const aggregateSourceID =
                        aggregateEgoNetworkNodeIDs[sourceIndex].join(',');
                    const aggregateTargetID =
                        aggregateEgoNetworkNodeIDs[targetIndex].join(',');

                    if (sourceIndex !== targetIndex) {
                        interEdges.push({
                            opacity: 1,
                            source: edge.source,
                            target: edge.target,
                            weight: edge.weight,
                            x1:
                                nodeDict[aggregateSourceID].x +
                                centerPositions[edge.source].x -
                                decollapsedSize[aggregateSourceID] / 2,
                            y1:
                                nodeDict[aggregateSourceID].y +
                                centerPositions[edge.source].y -
                                decollapsedSize[aggregateSourceID] / 2,
                            x2:
                                nodeDict[aggregateTargetID].x +
                                centerPositions[edge.target].x -
                                decollapsedSize[aggregateTargetID] / 2,
                            y2:
                                nodeDict[aggregateTargetID].y +
                                centerPositions[edge.target].y -
                                decollapsedSize[aggregateTargetID] / 2
                        });
                    }
                }
            }
        });
    }
    return interEdges;
});
const selectedEgoGraphsBaseAtom = atom<string[]>([]);
const selectedBandsBaseAtom = atom<string[]>([]);
/**
 * Stores currently selected ego-graphs
 */
export const selectedEgoGraphsAtom = atom(
    (get) => get(selectedEgoGraphsBaseAtom),
    (get, set, value:string) => {
        const prevSelection = get(selectedEgoGraphsBaseAtom).slice();
        const valIdx = prevSelection.indexOf(value);
        if (valIdx !== -1) {
            prevSelection.splice(valIdx);
        } else {
            prevSelection.push(value);
        }
        set(selectedEgoGraphsBaseAtom, prevSelection);
    }
);
/**
 * stores currently selected bands
 */
export const selectedBandsAtom = atom(
    (get) => get(selectedBandsBaseAtom),
    (get, set, value:string) => {
        const prevSelection = get(selectedBandsBaseAtom).slice();
        const valIdx = prevSelection.indexOf(value);
        if (valIdx !== -1) {
            prevSelection.splice(valIdx);
        } else {
            prevSelection.push(value);
        }
        set(selectedBandsBaseAtom, prevSelection);
    }
);
/**
 * Stores currently selected nodes
 */
export const selectedNodesAtom = atom((get) => {
    const nodes:string[] = [];
    get(selectedBandsAtom).forEach((selectedBand) => {
        const egoBundles = get(egoGraphBundlesAtom);
        // find the intersection that matches the selected band
        const containingBundle = Object.values(egoBundles).find((bundle) =>
            Object.keys(bundle.intersections).includes(selectedBand)
        );
        let bandNodes:string[];
        if(containingBundle){
            bandNodes=containingBundle.intersections[selectedBand];
        } else{
            const egoNetworkNetwork = get(aggregateNetworkAtom);
            const ids=selectedBand.split(',')
            const first = egoNetworkNetwork.nodes.filter(d => d.id === ids[0])
                .map(node =>node.neighbors).flat();
            const second=egoNetworkNetwork.nodes.filter(d => d.id === ids[1])
                .map(node =>node.neighbors).flat();
            bandNodes=first.filter(d=>second.includes(d));
        }
        nodes.push(...bandNodes);
    });
    get(selectedEgoGraphsAtom).forEach((selectedEgoGraph) => {
         const egoNetworkNetwork = get(aggregateNetworkAtom);
         const egoNodes = egoNetworkNetwork.nodes.filter(d => d.id === selectedEgoGraph)
                .map(node =>node.neighbors).flat()
        nodes.push(...egoNodes)
    });
    return [...new Set(nodes)];
});