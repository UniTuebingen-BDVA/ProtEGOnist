import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema.ts';
import { nodeRadius } from './egoGraphBundleStore.ts';
import { polarToCartesian } from '../../UtilityFunctions.ts';
import * as d3 from 'd3';

export type layoutNode = egoGraphNode & {
    index: number;
    identityNodes: number[];
    isCenter: boolean;
    cx: number;
    cy: number;
    pseudo: boolean; // invisible node
};

type position = {
    x: number;
    y: number;
};
type nodePositions = { [key: string]: position };

/**
 * Calculates the needed radius for the ego graph such that the nodes are not overlapping and evenly distributed
 */
function calculateEgoRadius(amount: number, minRadius: number) {
    const minCirc = 2 * Math.PI * minRadius;
    const circ = amount * nodeRadius > minCirc ? amount * nodeRadius : minCirc;
    return circ / (2 * Math.PI);
}

function calculateEgoRadii(
    egoGraphs: egoGraph[],
    intersections,
    minRadius: number,
    decollapseMode: string
) {
    const egoRadii: { [key: string]: number } = {};
    egoGraphs.forEach((egoGraph) => {
        egoRadii[egoGraph.centerNode.originalID] = calculateEgoRadius(
            decollapseMode === 'shared'
                ? egoGraphs.length === 1
                    ? egoGraph.nodes.length
                    : egoGraph.nodes.length -
                      intersections[egoGraph.centerNode.originalID].length
                : egoGraph.nodes.length,
            minRadius
        );
    });
    return egoRadii;
}

function calculateGroupLayout(
    egoGraphs: egoGraph[],
    intersections,
    minRadius: number,
    decollapseMode: string
) {
    const egoRadii = calculateEgoRadii(
        egoGraphs,
        intersections,
        minRadius,
        decollapseMode
    );
    // calculate center points for egobundles in the corresponding node of the force layout
    const maxRadius = Math.max(...Object.values(egoRadii));
    // set radius of the bundle such that all circles are accommodated
    const radiusOfEnclosingCircle =
        egoGraphs.length === 2 ? maxRadius * 2.7 : maxRadius * 3;
    const placementRadius = radiusOfEnclosingCircle - maxRadius * 1.2;
    const placementAngle = (2 * Math.PI) / egoGraphs.length;
    return {
        egoRadii,
        radiusOfEnclosingCircle,
        placementRadius,
        placementAngle
    };
}

function calculateNodePositions(
    layers: string[][][],
    numLayers: number,
    radius: number,
    angle: number,
    center: { x: number; y: number },
    rotation: number,
    isUnique: boolean
) {
    const positions: nodePositions = {};
    let scale;
    if (!isUnique) {
        const domain = layers.flat().flat();
        scale = d3.scaleBand<string>().range([0, angle]).domain(domain);
    }
    for (let i = 0; i <= numLayers; i++) {
        if (isUnique) {
            const domain = layers[i].flat();
            scale = d3.scaleBand<string>().range([0, angle]).domain(domain);
        }
        layers[i].forEach((subsection) => {
            const layerRadius = (radius / numLayers) * i;
            subsection.forEach((node) => {
                positions[node] = polarToCartesian(
                    center.x,
                    center.y,
                    layerRadius,
                    scale(node),
                    rotation
                );
            });
        });
    }
    return positions;
}

const offset = (1 / 50) * Math.PI;

function calculateSectionLayout(
    nodes: string[][][],
    nodeTotal: number,
    numLayers: number,
    egoRadius: number,
    center: { x: number; y: number },
    currRotation: number,
    isUnique: boolean
) {
    const proportion = nodes.flat().flat().length / nodeTotal;
    const angle = proportion * (Math.PI * 2 - offset);
    const nodePositions = calculateNodePositions(
        nodes,
        numLayers,
        egoRadius,
        angle,
        center,
        currRotation,
        isUnique
    );
    const start = polarToCartesian(
        center.x,
        center.y,
        egoRadius,
        0,
        currRotation
    );
    const end = polarToCartesian(
        center.x,
        center.y,
        egoRadius,
        angle,
        currRotation
    );
    return { nodePositions, start, end, angle };
}

function calculateEgoLayout(
    sections: { ids: string[]; nodes: string[][][] }[],
    currID: string,
    prevID: string,
    nextID: string,
    decollapseMode: string,
    egoRadius: number,
    numLayers: number,
    rotation: number,
    center: { x: number; y: number }
) {
    let positions: nodePositions = {};
    const bands = [];
    let uniqueNodes: string[][][] = [];
    let nodeTotal: number;
    let currRotation = rotation;
    if (decollapseMode !== 'shared' || currID === prevID) {
        uniqueNodes = sections.filter(
            (section) => section.ids.length === 1 && section.ids[0] === currID
        )[0].nodes;
        nodeTotal = sections
            .map((d) => d.nodes)
            .flat()
            .flat()
            .flat().length;
        const uniqueLayout = calculateSectionLayout(
            uniqueNodes,
            nodeTotal,
            numLayers,
            egoRadius,
            center,
            currRotation,
            true
        );
        positions = { ...positions, ...uniqueLayout.nodePositions };
        currRotation += uniqueLayout.angle;
    } else {
        nodeTotal = sections
            .filter((d) => d.ids.length > 1)
            .map((d) => d.nodes)
            .flat()
            .flat()
            .flat().length;
    }
    if (prevID !== currID) {
        const prevNodes = sections.filter(
            (section) =>
                section.ids.includes(prevID) && section.ids.includes(currID)
        )[0].nodes;
        const prevLayout = calculateSectionLayout(
            prevNodes,
            nodeTotal,
            numLayers,
            egoRadius,
            center,
            currRotation,
            false
        );
        positions = { ...positions, ...prevLayout.nodePositions };
        bands.push({
            ids: [currID, prevID],
            positions: [prevLayout.start, prevLayout.end],
            center: center
        });
        currRotation += prevLayout.angle;
        if (prevID !== nextID) {
            const sharedAllNodes = sections.filter(
                (section) => section.ids.length === 3
            )[0].nodes;
            const allLayout = calculateSectionLayout(
                sharedAllNodes,
                nodeTotal,
                numLayers,
                egoRadius,
                center,
                currRotation,
                false
            );
            positions = { ...positions, ...allLayout.nodePositions };
            bands.push({
                ids: [currID, prevID, nextID],
                positions: [allLayout.start, allLayout.end],
                center: center
            });
            currRotation += allLayout.angle;
            const nextNodes = sections.filter(
                (section) =>
                    section.ids.includes(nextID) && section.ids.includes(currID)
            )[0].nodes;
            const nextLayout = calculateSectionLayout(
                nextNodes,
                nodeTotal,
                numLayers,
                egoRadius,
                center,
                currRotation,
                false
            );
            positions = { ...positions, ...nextLayout.nodePositions };
            bands.push({
                ids: [currID, nextID],
                positions: [nextLayout.start, nextLayout.end],
                center: center
            });
        }
    }
    return { positions, bands };
}

function transformBandData(
    bands: {
        ids: string[];
        positions: [position, position];
        center: position;
    }[]
) {
    const transformedData = [];
    bands.forEach((search_band, index) => {
        if (index < bands.length - 1) {
            const bandDict = {
                [search_band.ids[0]]: {
                    positions: search_band.positions,
                    center: search_band.center
                }
            };
            bands
                .slice(index + 1)
                .filter((band) =>
                    band.ids.every((id) => search_band.ids.includes(id))
                )
                .forEach(
                    (band) =>
                        (bandDict[band.ids[0]] = {
                            positions: band.positions,
                            center: band.center
                        })
                );
            transformedData.push({ ids: search_band.ids, bands: bandDict });
        }
    });
    return transformedData;
}

function iterateEgoGraphs(
    egoGraphs: egoGraph[],
    radiusOfEnclosingCircle: number,
    placementRadius: number,
    placementAngle: number,
    decollapseMode: string,
    egoRadii: { [key: string]: number },
    numLayers: number
) {
    let positions = {};
    let bands = [];
    const centers = [];
    for (let i = 0; i < egoGraphs.length; i++) {
        const currId = egoGraphs[i].centerNode.originalID;
        let prevId: string;
        let nextId: string;
        if (i === 0) {
            prevId = egoGraphs[egoGraphs.length - 1].centerNode.originalID;
        } else {
            prevId = egoGraphs[i - 1].centerNode.originalID;
        }
        if (i === egoGraphs.length - 1) {
            nextId = egoGraphs[0].centerNode.originalID;
        } else {
            nextId = egoGraphs[i + 1].centerNode.originalID;
        }
        const center = polarToCartesian(
            radiusOfEnclosingCircle / 2,
            radiusOfEnclosingCircle / 2,
            placementRadius,
            i * placementAngle,
            Math.PI
        );
        center.id = egoGraphs[i].centerNode.originalID;
        center.outerSize = egoRadii[egoGraphs[i].centerNode.originalID];
        centers.push(center);
        const egoLayout = calculateEgoLayout(
            egoGraphs[i].sections,
            currId,
            prevId,
            nextId,
            decollapseMode,
            egoRadii[currId],
            numLayers,
            placementAngle * i,
            center
        );
        positions = {
            ...positions,
            ...egoLayout.positions
        };
        bands.push(...egoLayout.bands);
    }
    const allNodes = egoGraphs.map((d) => d.nodes).flat();
    const layoutNodeMap = createLayoutNodes(allNodes, positions);
    const edges = createInteractionEdges(
        layoutNodeMap,
        egoGraphs.map((egoGraph) => egoGraph.edges).flat()
    );
    return {
        nodes: [...layoutNodeMap.values()],
        identityEdges: createIdentityEdges([...layoutNodeMap.values()]),
        edges: edges,
        bandData: transformBandData(bands),
        centers
    };
}

function createIdentityEdges(layoutNodes: layoutNode[]) {
    const identityEdges: identityEdge[] = [];
    const usedNodeIDs: string[] = [];
    layoutNodes.forEach((node) => {
        if (!usedNodeIDs.includes(node.originalID)) {
            const sourceIndex = node.index;
            const x1 = node.cx;
            const y1 = node.cy;
            node.identityNodes.map((index) => {
                const targetNode = layoutNodes[index];
                const targetIndex = targetNode.index;
                const x2 = targetNode.cx;
                const y2 = targetNode.cy;
                const id = node.id + '_' + targetNode.id;
                identityEdges.push({
                    sourceIndex,
                    targetIndex,
                    x1,
                    x2,
                    y1,
                    y2,
                    id
                });
            });
            usedNodeIDs.push(node.originalID);
        }
    });
    return identityEdges;
}

function createInteractionEdges(
    nodeMap: Map<string, layoutNode>,
    edges: egoGraphEdge[]
) {
    const layoutEdges: layoutEdge[] = [];
    edges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;
        //check if both source and target are in nodeDict
        if (nodeMap.has(sourceId) && nodeMap.has(targetId)) {
            const source = nodeMap.get(sourceId);
            const target = nodeMap.get(targetId);
            const currEdge: layoutEdge = {
                ...edge,
                sourceIndex: source.index,
                targetIndex: target.index,
                x1: source.cx,
                x2: target.cx,
                y1: source.cy,
                y2: target.cy
            };
            layoutEdges.push(currEdge);
        }
    });
    return layoutEdges;
}

function createLayoutNodes(
    nodes: layoutNode[],
    positions: { [key: string]: position }
) {
    const layoutNodes = new Map<string, layoutNode>();
    let index = 0;
    nodes.forEach((node) => {
        if (Object.keys(positions).includes(node.id)) {
            layoutNodes.set(node.id, {
                ...node,
                index: index,
                cx: positions[node.id].x,
                cy: positions[node.id].y
            });
            node.identityNodeKeys.forEach((key) => {
                if (layoutNodes.has(key)) {
                    const identityNode = layoutNodes.get(key);
                    const indices = [...identityNode.identityNodes, index];
                    layoutNodes.set(key, {
                        ...identityNode,
                        identityNodes: indices
                    });
                }
            });
            index += 1;
        }
    });
    return layoutNodes;
}

export function calculateLayout2(
    egoGraphs: egoGraph[],
    intersections,
    decollapseMode: string,
    minRadius: number,
    numLayers: number
) {
    // sort egoGraphs by ID
    egoGraphs.sort((a, b) => {
        if (a.centerNode.originalID > b.centerNode.originalID) {
            return 1;
        } else if (a.centerNode.originalID < b.centerNode.originalID) {
            return -1;
        } else {
            return 0;
        }
    });
    const {
        egoRadii,
        radiusOfEnclosingCircle,
        placementRadius,
        placementAngle
    } = calculateGroupLayout(
        egoGraphs,
        intersections,
        minRadius,
        decollapseMode
    );

    return {
        ...iterateEgoGraphs(
            egoGraphs,
            radiusOfEnclosingCircle,
            placementRadius,
            placementAngle,
            decollapseMode,
            egoRadii,
            numLayers
        ),
        radii: egoRadii,
        decollapsedSize: radiusOfEnclosingCircle,
        nodeRadius: nodeRadius
    };
}
