import * as d3 from 'd3';
import { polarToCartesian } from '../../UtilityFunctions';
import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema';

export type layoutNode = egoGraphNode & {
    index: number;
    identityNodes: number[];
    isCenter: boolean;
    cx: number;
    cy: number;
    hovered: boolean;
    pseudo: boolean; // invisible node
};
type layoutEdge = egoGraphEdge & {
    sourceIndex: number;
    targetIndex: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};
type identityEdge = {
    id: string;
    sourceIndex: number;
    targetIndex: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};

export interface egoGraphLayout {
    nodes: layoutNode[];
    edges: layoutEdge[];
    identityEdges: identityEdge[];
    maxradius: number;
    centers: { x: number; y: number; id: string }[];
}

/**
 * Create nodes for a layer in the ego graph
 * @param {egoGraphNode[]} layerNodes
 * @param {string[]} sortOrder
 * @param {number} center
 * @param {number} radius
 * @param {[number,number]} xRange
 * @param {{ x: number; y: number }} transformVector
 * @param {number} offset
 */
function createLayerNodes(
    layerNodes: egoGraphNode[],
    sortOrder: string[],
    center: number,
    radius: number,
    xRange: [number, number], // full circle: 0, 2PI
    transformVector: { x: number; y: number },
    offset: number
) {
    const nodes: { [key: string]: layoutNode } = {};
    const x = d3.scaleBand().range(xRange).domain(sortOrder);
    let maxradius: number;
    if (layerNodes.length > 1) {
        maxradius =
            ((center / Math.sin((Math.PI - x.bandwidth()) / 2)) *
                Math.sin(x.bandwidth())) /
            2;
    } else {
        maxradius = radius;
    }
    layerNodes.forEach((node) => {
        const nodeCoords = polarToCartesian(
            center,
            center,
            radius,
            x(node.id)!,
            offset
        );
        nodes[node.id] = {
            ...node,
            index: -1,
            isCenter: false,
            cx: nodeCoords.x + transformVector.x,
            cy: nodeCoords.y + transformVector.y,
            hovered: false,
            pseudo: false,
            identityNodes: []
        };
    });
    return { nodes, maxradius };
}

/**
 * assigns inner nodes to their corresponding outer nodes
 * @param { [key: string]: egoGraphNode } nodeDict - dict of nodes
 * @param {egoGraphEdge[]} edges - edges between nodes
 */
function assignToInnerNodes(
    nodeDict: { [key: string]: egoGraphNode },
    edges: egoGraphEdge[]
) {
    const nodeAssignment: { [key: string]: string[] } = {};
    edges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;
        if (
            Object.keys(nodeDict).includes(sourceId) &&
            Object.keys(nodeDict).includes(targetId)
        ) {
            if (
                nodeDict[sourceId].centerDist === 1 &&
                !Object.keys(nodeAssignment).includes(sourceId)
            ) {
                nodeAssignment[sourceId] = [];
            }
            if (
                nodeDict[targetId].centerDist === 1 &&
                !Object.keys(nodeAssignment).includes(targetId)
            ) {
                nodeAssignment[targetId] = [];
            }
            if (
                nodeDict[sourceId].centerDist === 2 &&
                nodeDict[targetId].centerDist === 1
            ) {
                nodeAssignment[targetId].push(sourceId);
            } else if (
                nodeDict[targetId].centerDist === 2 &&
                nodeDict[sourceId].centerDist === 1
            ) {
                nodeAssignment[sourceId].push(targetId);
            }
        }
    });
    return nodeAssignment;
}

/**
 * calculates overlaps between inner nodes
 * @param { [key: string]: string[] } nodeAssignment - inner nodes with their assigned outer nodes
 * @param {string[]} keys: node ids
 */
export function calculateOverlaps(
    nodeAssignment: { [key: string]: string[] },
    keys: string[]
) {
    const intersections: string[][][] = Array(keys.length)
        .fill(undefined)
        .map(() => Array<string[]>(keys.length).fill([]));
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            intersections[i][j] = nodeAssignment[keys[i]].filter((value) =>
                nodeAssignment[keys[j]].includes(value)
            );
        }
    }
    return intersections;
}

/**
 * gets maximum index in intersection matrix
 * @param {number[][]} matrix - matrix of intersection sizes
 */
export function getMaxIndex(matrix: number[][]) {
    let max = -1;
    let maxIndex = [-1, -1];
    for (let i = 0; i < matrix.length; i++) {
        for (let j = i + 1; j < matrix[i].length; j++) {
            if (matrix[i][j] > max) {
                max = matrix[i][j];
                maxIndex = [i, j];
            }
        }
    }
    return maxIndex;
}

/**
 * sorts nodes according to their intersections
 * @param {number[][]} intersectingNodes
 * @param { [key: string]: string[] } nodeAssignment
 * @param {string[]} innerNodes
 */
export function sortByOverlap(
    intersectingNodes: string[][][],
    nodeAssignment: { [key: string]: string[] },
    innerNodes: string[]
) {
    const intersections = intersectingNodes.map((row, i) =>
        row.map((column, j) => {
            if (j > i) {
                return column.length;
            } else return -1;
        })
    );
    const getIntersectingNodes = (
        currInnerOrder: number[],
        left: boolean
    ): string[] => {
        if (left) {
            return currInnerOrder[0] < currInnerOrder[1]
                ? intersectingNodes[currInnerOrder[0]][currInnerOrder[1]]
                : intersectingNodes[currInnerOrder[1]][currInnerOrder[0]];
        } else {
            return currInnerOrder[currInnerOrder.length - 2] <
                currInnerOrder[currInnerOrder.length - 1]
                ? intersectingNodes[currInnerOrder[currInnerOrder.length - 2]][
                      currInnerOrder[currInnerOrder.length - 1]
                  ]
                : intersectingNodes[currInnerOrder[currInnerOrder.length - 1]][
                      currInnerOrder[currInnerOrder.length - 2]
                  ];
        }
    };
    const deleteColRow = (index: number) => {
        for (let i = 0; i < intersections.length; i++) {
            intersections[i][index] = -1;
            intersections[index][i] = -1;
        }
    };
    const maxIndex = getMaxIndex(intersections);
    let index = -1;
    const innerNodeOrder = [maxIndex[0], maxIndex[1]];
    intersections[maxIndex[0]][maxIndex[1]] = -1;
    intersections[maxIndex[1]][maxIndex[0]] = -1;
    let intersection = getIntersectingNodes(innerNodeOrder, true);
    const outerNodeOrder: string[] = [];
    outerNodeOrder.push(
        ...nodeAssignment[innerNodes[innerNodeOrder[0]]].filter(
            (d) => !intersection.includes(d)
        )
    );
    outerNodeOrder.push(...intersection);
    outerNodeOrder.push(
        ...nodeAssignment[innerNodes[innerNodeOrder[1]]].filter(
            (d) => !outerNodeOrder.includes(d)
        )
    );
    let left = true;
    while (innerNodeOrder.length < intersections.length) {
        let localMax = -1;
        intersections[innerNodeOrder[0]][
            innerNodeOrder[innerNodeOrder.length - 1]
        ] = -1;
        intersections[innerNodeOrder[innerNodeOrder.length - 1]][
            innerNodeOrder[0]
        ] = -1;
        for (let i = 0; i < intersections.length; i++) {
            //search for next highest number in columns and rows corresponding
            // to the leftmost and rightmost node in the sort order
            if (localMax < intersections[i][innerNodeOrder[0]]) {
                localMax = intersections[i][innerNodeOrder[0]];
                index = i;
                left = true;
            }
            if (localMax < intersections[innerNodeOrder[0]][i]) {
                localMax = intersections[innerNodeOrder[0]][i];
                index = i;
                left = true;
            }
            if (
                localMax <
                intersections[innerNodeOrder[innerNodeOrder.length - 1]][i]
            ) {
                localMax =
                    intersections[innerNodeOrder[innerNodeOrder.length - 1]][i];
                index = i;
                left = false;
            }
            if (
                localMax <
                intersections[i][innerNodeOrder[innerNodeOrder.length - 1]]
            ) {
                localMax =
                    intersections[i][innerNodeOrder[innerNodeOrder.length - 1]];
                index = i;
                left = false;
            }
        }
        const intersection = getIntersectingNodes(innerNodeOrder, left).filter(
            (d) => !outerNodeOrder.includes(d)
        );
        const otherNodes = nodeAssignment[innerNodes[index]].filter(
            (d) => !outerNodeOrder.includes(d)
        );
        if (left) {
            deleteColRow(innerNodeOrder[0]);
            innerNodeOrder.unshift(index);
            outerNodeOrder.unshift(...intersection);
            outerNodeOrder.unshift(...otherNodes);
        } else {
            deleteColRow(innerNodeOrder[innerNodeOrder.length - 1]);
            innerNodeOrder.push(index);
            outerNodeOrder.push(...intersection);
            outerNodeOrder.push(...otherNodes);
        }
    }
    intersection =
        innerNodeOrder[0] < innerNodeOrder[innerNodeOrder.length - 1]
            ? intersectingNodes[innerNodeOrder[0]][
                  innerNodeOrder[innerNodeOrder.length - 1]
              ]
            : intersectingNodes[innerNodeOrder[innerNodeOrder.length - 1]][
                  innerNodeOrder[0]
              ];
    outerNodeOrder.push(
        ...intersection.filter((d) => !outerNodeOrder.includes(d))
    );
    return {
        innerNodeOrder: innerNodeOrder.map((d) => innerNodes[d]),
        outerNodeOrder
    };
}

/**
 * Sorts nodes in egograph
 * @param {egoGraphNode[]} nodes
 * @param {egoGraphEdge[]} edges
 */
function sortNodes(nodes: egoGraphNode[], edges: egoGraphEdge[]) {
    const nodeDict: { [key: string]: egoGraphNode } = {};
    nodes.forEach((node) => (nodeDict[node.id] = node));
    const nodeAssignment = assignToInnerNodes(nodeDict, edges);
    const innerNodes = Object.keys(nodeAssignment);
    const intersectingNodes = calculateOverlaps(nodeAssignment, innerNodes);
    if (intersectingNodes.length > 1) {
        return sortByOverlap(intersectingNodes, nodeAssignment, innerNodes);
    } else {
        return {
            innerNodeOrder: innerNodes,
            outerNodeOrder: [...new Set(Object.values(nodeAssignment).flat())]
        };
    }
}

function sortPairwiseIntersection(
    nodes: string[],
    nodeDict: { [key: string]: egoGraphNode },
    graphID: string
) {
    nodes.sort(
        (a, b) =>
            nodeDict[graphID + '_' + a].numEdges -
            nodeDict[graphID + '_' + b].numEdges
    );
    return nodes;
}

/**
 *
 * @param {egoGraph[]} egoGraphs
 * @param {{ [key: string]: string[] }} intersections
 * @param {number} nodeSize
 * @param {number} innerSize
 * @param {number} outerSize
 */
export function calculateLayout(
    egoGraphs: egoGraph[],
    intersections: { [key: string]: string[] },
    nodeSize: number,
    innerSize: number,
    outerSize: number
) {
    if (egoGraphs.length > 1) {
        let graphCenters: { x: number; y: number; id: string }[];
        const layout: egoGraphLayout = {
            nodes: [],
            edges: [],
            identityEdges: [],
            maxradius: 10000,
            centers: []
        };
        if (egoGraphs.length === 2) {
            graphCenters = [
                {
                    x: outerSize,
                    y: nodeSize / 2,
                    id: egoGraphs[0].centerNode.originalID
                },
                {
                    x: nodeSize - outerSize,
                    y: nodeSize / 2,
                    id: egoGraphs[1].centerNode.originalID
                }
            ];
        } else {
            graphCenters = [
                {
                    x: outerSize,
                    y: nodeSize / 2,
                    id: egoGraphs[0].centerNode.originalID
                },
                {
                    x: nodeSize - outerSize,
                    y: outerSize,
                    id: egoGraphs[1].centerNode.originalID
                },
                {
                    x: nodeSize - outerSize,
                    y: nodeSize - outerSize,
                    id: egoGraphs[2].centerNode.originalID
                }
            ];
        }
        const fullRange = 2 * Math.PI;
        const xRanges: [[number, number], [number, number]] = [
            [0, fullRange / egoGraphs.length],
            [fullRange / egoGraphs.length, fullRange]
        ];
        let layoutNodeDict: { [key: string]: layoutNode } = {};
        let nodeDict: { [key: string]: egoGraphNode } = {};
        egoGraphs[egoGraphs.length - 1].nodes.forEach(
            (node) => (nodeDict[node.id] = node)
        );
        let pairwiseIntersections = sortPairwiseIntersection(
            intersections[
                [
                    egoGraphs[egoGraphs.length - 1].centerNode.originalID,
                    egoGraphs[0].centerNode.originalID
                ]
                    .sort()
                    .toString()
            ],
            nodeDict,
            egoGraphs[egoGraphs.length - 1].centerNode.originalID
        ).reverse();
        for (let i = 0; i < egoGraphs.length; i++) {
            nodeDict = {};
            egoGraphs[i].nodes.forEach((node) => (nodeDict[node.id] = node));
            const firstGraphId = egoGraphs[i].centerNode.originalID;
            let secondGraphId;
            if (i === egoGraphs.length - 1) {
                secondGraphId = egoGraphs[0].centerNode.originalID;
            } else {
                secondGraphId = egoGraphs[i + 1].centerNode.originalID;
            }
            const intersectingNodes = [];
            let nextPairwiseIntersections =
                intersections[[firstGraphId, secondGraphId].sort().toString()];
            // if we only have selected two egographs we don't sort both of them to prevent crossing edges.
            if (egoGraphs.length > 2) {
                nextPairwiseIntersections = sortPairwiseIntersection(
                    nextPairwiseIntersections,
                    nodeDict,
                    egoGraphs[i].centerNode.originalID
                );
            }
            // push all the other intersecting nodes
            const otherIntersections = egoGraphs[i].nodes
                .map((d) => d.originalID)
                .filter(
                    (id) =>
                        !pairwiseIntersections.includes(id) &&
                        !nextPairwiseIntersections.includes(id) &&
                        !intersections[
                            egoGraphs[i].centerNode.originalID
                        ].includes(id)
                );
            intersectingNodes.push(...pairwiseIntersections);
            intersectingNodes.push(...otherIntersections);
            intersectingNodes.push(...nextPairwiseIntersections);
            pairwiseIntersections = nextPairwiseIntersections.reverse();
            const currLayout = calculateMultiLayout(
                egoGraphs[i],
                innerSize,
                outerSize,
                intersections[egoGraphs[i].centerNode.originalID],
                intersectingNodes.reverse(),
                graphCenters[i],
                xRanges,
                -fullRange / egoGraphs.length / 2 +
                    (fullRange / egoGraphs.length) * i
            );
            layoutNodeDict = { ...currLayout.nodes, ...layoutNodeDict };
            layout.maxradius = Math.max(
                Math.min(currLayout.maxradius, layout.maxradius),
                2
            );
        }
        layout.edges = createEgoEdges(
            layoutNodeDict,
            egoGraphs.map((d) => d.edges).flat()
        );
        layout.identityEdges = createIdentityEdges(
            layoutNodeDict,
            egoGraphs.map((d) => d.centerNode.originalID)
        );
        layout.nodes = Object.values(layoutNodeDict);
        layout.centers = graphCenters;
        return layout;
    } else {
        return calculateEgoLayout(egoGraphs[0], innerSize, outerSize);
    }
}

function calculateMultiLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number,
    uniqueNodeIds: string[],
    sharedNodeIds: string[],
    graphCenter: { x: number; y: number },
    xRanges: [[number, number], [number, number]],
    offset: number
) {
    const transformVector = {
        x: graphCenter.x - outerSize,
        y: graphCenter.y - outerSize
    };
    const nodeDict: { [key: string]: egoGraphNode } = {};
    graph.nodes.forEach((node) => (nodeDict[node.id] = node));
    let nodes: { [key: string]: layoutNode };
    const sharedNodesLayout = calculateLayoutSharedNodes(
        sharedNodeIds.map(
            (nodeId) => nodeDict[graph.centerNode.originalID + '_' + nodeId]
        ),
        sharedNodeIds.map(
            (nodeId) => graph.centerNode.originalID + '_' + nodeId
        ),
        outerSize,
        outerSize,
        xRanges[0],
        1 - innerSize / outerSize,
        transformVector,
        offset
    );
    nodes = sharedNodesLayout.nodes;
    let maxRadius = sharedNodesLayout.maxradius;
    if (uniqueNodeIds.length > 0) {
        const uniqueNodesLayout = calculateLayoutUniqueNodes(
            uniqueNodeIds.map(
                (nodeId) => nodeDict[graph.centerNode.originalID + '_' + nodeId]
            ),
            graph.edges,
            innerSize,
            outerSize,
            xRanges[1],
            transformVector,
            offset
        );
        nodes = {
            ...uniqueNodesLayout.nodesLayer1Layout.nodes,
            ...uniqueNodesLayout.nodesLayer2Layout.nodes,
            ...nodes
        };
        maxRadius = Math.min(
            uniqueNodesLayout.nodesLayer1Layout.maxradius,
            uniqueNodesLayout.nodesLayer2Layout.maxradius,
            maxRadius
        );
    }
    nodes[graph.centerNode.id] = createCenterNode(
        graph.nodes[graph.nodes.map((d) => d.id).indexOf(graph.centerNode.id)],
        outerSize,
        transformVector
    );
    return {
        nodes: nodes,
        maxradius: maxRadius
    };
}

function moveToCenter(
    point: { x: number; y: number },
    center: { x: number; y: number },
    factor: number
) {
    const dx = center.x - point.x;
    const dy = center.y - point.y;
    return { x: point.x + dx * factor, y: point.y + dy * factor };
}

/**
 * creates layout for shared nodes according to a sort order
 * @param {egoGraphNode[]} nodes
 * @param {string[]} sortOrder
 * @param {number} center
 * @param {number} radius
 * @param {[number, number]} xRange
 * @param {string} factor
 * @param {{ x: number; y: number }} graphCenter
 * @param {number} offset
 */
function calculateLayoutSharedNodes(
    nodes: egoGraphNode[],
    sortOrder: string[],
    center: number,
    radius: number,
    xRange: [number, number],
    factor: number,
    graphCenter: { x: number; y: number },
    offset: number
) {
    const nodeLayout = createLayerNodes(
        nodes,
        sortOrder,
        center,
        radius,
        xRange,
        graphCenter,
        offset
    );
    Object.keys(nodeLayout.nodes).forEach((nodeId) => {
        if (nodeLayout.nodes[nodeId].centerDist === 1) {
            nodeLayout.nodes[`${nodeId}_pseudo`] = {
                ...nodeLayout.nodes[nodeId],
                pseudo: true
            };
            const newPos = moveToCenter(
                {
                    x: nodeLayout.nodes[nodeId].cx,
                    y: nodeLayout.nodes[nodeId].cy
                },
                { x: graphCenter.x + center, y: graphCenter.y + center },
                factor
            );
            nodeLayout.nodes[nodeId].cx = newPos.x;
            nodeLayout.nodes[nodeId].cy = newPos.y;
        }
    });
    return nodeLayout;
}

/**
 * creates layout for unique nodes and sorts them in a way to align inner and outer nodes
 * @param {egoGraphNode[]} nodes
 * @param {egoGraphEdge[]} edges
 * @param {number} innerSize
 * @param {number} outerSize
 * @param {[number, number]} xRange
 * @param {{x: number, y:number}} transformVector - vector to transform all points to their position
 * @param {number} offset
 */
function calculateLayoutUniqueNodes(
    nodes: egoGraphNode[],
    edges: egoGraphEdge[],
    innerSize: number,
    outerSize: number,
    xRange: [number, number],
    transformVector: { x: number; y: number },
    offset: number
) {
    const { innerNodeOrder, outerNodeOrder } = sortNodes(nodes, edges);
    const nodesLayer1 = nodes.filter((d) => d.centerDist === 1);
    const nodesLayer2 = nodes.filter((d) => d.centerDist === 2);
    nodesLayer1.forEach((node) => {
        if (!innerNodeOrder.includes(node.id)) {
            innerNodeOrder.push(node.id);
        }
    });
    nodesLayer2.forEach((node) => {
        if (!outerNodeOrder.includes(node.id)) {
            outerNodeOrder.push(node.id);
        }
    });
    const nodesLayer1Layout = createLayerNodes(
        nodesLayer1,
        innerNodeOrder,
        outerSize,
        innerSize,
        xRange,
        transformVector,
        offset
    );
    const nodesLayer2Layout = createLayerNodes(
        nodesLayer2,
        outerNodeOrder,
        outerSize,
        outerSize,
        xRange,
        transformVector,
        offset
    );
    return { nodesLayer1Layout, nodesLayer2Layout };
}

/**
 * creates Identity edges
 * @param { [key: string]: layoutNode } nodeDict - dict of nodes with positions
 * @param {string[]} centerNodes - nodes in center of egographs, used to derive ids of nodes
 */
function createIdentityEdges(
    nodeDict: { [key: string]: layoutNode },
    centerNodes: string[]
): identityEdge[] {
    const proteinIds = new Set(
        Object.keys(nodeDict).map((d) => d.split('_')[1])
    );
    const edges: identityEdge[] = [];
    [...proteinIds].forEach((proteinId) => {
        const nodeIds = centerNodes
            .map((d) => d + '_' + proteinId)
            .filter((nodeId) => Object.keys(nodeDict).includes(nodeId));
        nodeIds.forEach((nodeId) => {
            nodeDict[nodeId].identityNodes = nodeIds
                .map((d) => {
                    if (Object.keys(nodeDict).includes(d + '_pseudo')) {
                        return [
                            nodeDict[d].index,
                            nodeDict[d + '_pseudo'].index
                        ];
                    }
                    return [nodeDict[d].index];
                })
                .flat();
        });
        const layer1Nodes = nodeIds.filter(
            (nodeId) => nodeDict[nodeId].centerDist === 1
        );
        if (nodeIds.length > 1) {
            for (let i = 0; i < nodeIds.length; i++) {
                for (let j = i + 1; j < nodeIds.length; j++) {
                    // don't draw an edge if the nodes are first layer nodes but not pseudo
                    let firstId = nodeIds[i];
                    let secondId = nodeIds[j];
                    if (Object.keys(nodeDict).includes(firstId + '_pseudo')) {
                        firstId = firstId + '_pseudo';
                    }
                    if (Object.keys(nodeDict).includes(secondId + '_pseudo')) {
                        secondId = secondId + '_pseudo';
                    }
                    edges.push({
                        sourceIndex: nodeDict[firstId].index,
                        targetIndex: nodeDict[secondId].index,
                        id: firstId + '_' + secondId,
                        x1: nodeDict[firstId].cx,
                        y1: nodeDict[firstId].cy,
                        x2: nodeDict[secondId].cx,
                        y2: nodeDict[secondId].cy
                    });
                }
            }
            layer1Nodes.forEach((nodeId) => {
                edges.push({
                    sourceIndex: nodeDict[nodeId].index,
                    targetIndex: nodeDict[nodeId + '_pseudo'].index,
                    id: nodeId + '_' + nodeId + '_pseudo',
                    x1: nodeDict[nodeId].cx,
                    y1: nodeDict[nodeId].cy,
                    x2: nodeDict[nodeId + '_pseudo'].cx,
                    y2: nodeDict[nodeId + '_pseudo'].cy
                });
            });
        }
    });
    return edges;
}

/**
 * create edges in egoGraph
 * @param { [key: string]: layoutNode } nodeDict - dict of all edges in egograph with positions
 * @param {egoGraphEdge[]} edges - edges to draw
 */
function createEgoEdges(
    nodeDict: { [key: string]: layoutNode },
    edges: egoGraphEdge[]
) {
    Object.values(nodeDict).forEach((elem, index) => (elem.index = index));
    const layoutEdges: layoutEdge[] = [];
    edges.forEach((edge) => {
        const sourceId = edge.source;
        const targetId = edge.target;
        const currEdge: layoutEdge = {
            ...edge,
            sourceIndex: nodeDict[sourceId].index,
            targetIndex: nodeDict[targetId].index,
            x1: nodeDict[sourceId].cx,
            x2: nodeDict[targetId].cx,
            y1: nodeDict[sourceId].cy,
            y2: nodeDict[targetId].cy
        };
        layoutEdges.push(currEdge);
    });
    return layoutEdges;
}

/**
 * Creates node at center
 * @param {egoGraphNode} centerNode
 * @param {number} outerSize
 * @param {x:number,y:number>} transformVector
 */
function createCenterNode(
    centerNode: egoGraphNode,
    outerSize: number,
    transformVector: { x: number; y: number }
): layoutNode {
    return {
        ...centerNode,
        index: -1,
        isCenter: true,
        cx: outerSize + transformVector.x,
        cy: outerSize + transformVector.y,
        hovered: false,
        pseudo: false,
        identityNodes: []
    };
}

/**
 * Create layout for egograph
 * @param {egoGraph} graph
 * @param {number} innerSize
 * @param {number} outerSize
 */
export function calculateEgoLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number
) {
    const { nodesLayer1Layout, nodesLayer2Layout } = calculateLayoutUniqueNodes(
        graph.nodes,
        graph.edges,
        innerSize,
        outerSize,
        [0, 2 * Math.PI],
        { x: 0, y: 0 },
        0
    );
    const nodes = { ...nodesLayer1Layout.nodes, ...nodesLayer2Layout.nodes };
    // add inner node to layout at center position
    nodes[graph.centerNode.id] = createCenterNode(
        graph.nodes[graph.nodes.map((d) => d.id).indexOf(graph.centerNode.id)],
        outerSize,
        { x: 0, y: 0 }
    );
    Object.values(nodes).forEach((elem, index) => {
        elem.index = index;
        elem.identityNodes=[index];
    });
    const edges = createEgoEdges(nodes, graph.edges);
    return {
        nodes: Object.values(nodes).sort((a, b) => a.index - b.index),
        edges,
        identityEdges: [],
        maxradius: Math.max(
            Math.min(nodesLayer1Layout.maxradius, nodesLayer2Layout.maxradius),
            2
        ),
        centers: [
            { x: outerSize, y: outerSize, id: graph.centerNode.originalID }
        ]
    };
}
