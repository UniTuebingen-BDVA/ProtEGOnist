import * as d3 from 'd3';
import { polarToCartesian } from '../../UtilityFunctions';
import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema';

export type layoutNode = egoGraphNode & {
    index: number;
    isCenter: boolean;
    cx: number;
    cy: number;
    hovered: boolean;
    numEdges: number;
};
type layoutEdge = egoGraphEdge & {
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
    maxradius: number;
}

/**
 * Create nodes for a layer in the ego graph
 * @param {egoGraphNode[]} layerNodes
 * @param {string[]} sortOrder
 * @param {number} center
 * @param {number} radius
 * @param {number} circlePortion
 */
function createLayerNodes(
    layerNodes: egoGraphNode[],
    sortOrder: string[],
    center: number,
    radius: number,
    circlePortion: number
) {
    const nodes: { [key: string]: layoutNode } = {};
    const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI * circlePortion])
        .domain(sortOrder);
    const maxradius: number =
        ((center / Math.sin((Math.PI - x.bandwidth()) / 2)) *
            Math.sin(x.bandwidth())) /
        2;
    layerNodes.forEach((node) => {
        const nodeCoords = polarToCartesian(
            center,
            center,
            radius,
            x(node.id)!
        );
        nodes[node.id] = {
            ...node,
            index: -1,
            isCenter: false,
            cx: nodeCoords.x,
            cy: nodeCoords.y,
            hovered: false,
            numEdges: 0
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
        if (
            nodeDict[edge.source].centerDist === 1 &&
            !Object.keys(nodeAssignment).includes(edge.source)
        ) {
            nodeAssignment[edge.source] = [];
        }
        if (
            nodeDict[edge.target].centerDist === 1 &&
            !Object.keys(nodeAssignment).includes(edge.target)
        ) {
            nodeAssignment[edge.target] = [];
        }
        if (
            nodeDict[edge.source].centerDist === 2 &&
            nodeDict[edge.target].centerDist === 1
        ) {
            nodeAssignment[edge.target].push(edge.source);
        } else if (
            nodeDict[edge.target].centerDist === 2 &&
            nodeDict[edge.source].centerDist === 1
        ) {
            nodeAssignment[edge.source].push(edge.target);
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
    return sortByOverlap(intersectingNodes, nodeAssignment, innerNodes);
}

function sortByNumEdges(nodes: egoGraphNode[]) {
    return nodes.sort((a, b) => a.numEdges - b.numEdges);
}

function calculateMultiLayout(
    egoGraphs: egoGraph[],
    height,
    width,
    innerSize: number,
    outerSize: number
) {
    if (egoGraphs.length > 1) {
        let graphCenters;
        let overlaps={};
        let pairwiseOverlaps = [];
        let uniqueNodes = [];
        for (let i = 0; i < egoGraphs.length-1; i++) {
            for (let j = i + 1; j < egoGraphs.length; j++) {

            }
        }

        if (egoGraphs.length === 2) {
            graphCenters = [
                { x: outerSize, y: outerSize },
                { x: width - outerSize, y: outerSize }
            ];
        } else if (egoGraphs.length === 3) {
            graphCenters = [
                { x: outerSize, y: height / 2 },
                {
                    x: width - outerSize,
                    y: outerSize
                },
                { x: width - outerSize, y: height - outerSize }
            ];
        }
    } else {
        return calculateEgoLayout(egoGraphs[0], innerSize, outerSize, 1);
    }
}

/**
 * Create layout for egograph
 * @param {egoGraph} graph
 * @param {number} innerSize
 * @param {number} outerSize
 * @param {number} circlePortion
 */
export function calculateEgoLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number,
    circlePortion: number
): egoGraphLayout {
    const { innerNodeOrder, outerNodeOrder } = sortNodes(
        graph.nodes,
        graph.edges
    );
    const nodesLayer1 = graph.nodes.filter((d) => d.centerDist === 1);
    const nodesLayer2 = graph.nodes.filter((d) => d.centerDist === 2);
    const nodesLayer1Layout = createLayerNodes(
        nodesLayer1,
        innerNodeOrder,
        outerSize,
        innerSize,
        circlePortion
    );
    const nodesLayer2Layout = createLayerNodes(
        nodesLayer2,
        outerNodeOrder,
        outerSize,
        outerSize,
        circlePortion
    );
    const nodes = { ...nodesLayer1Layout.nodes, ...nodesLayer2Layout.nodes };
    nodes[graph.centerNode.id] = {
        ...graph.centerNode,
        index: -1,
        isCenter: true,
        cx: outerSize,
        cy: outerSize,
        hovered: false,
        numEdges: 0
    };
    Object.values(nodes).forEach((elem, index) => (elem.index = index));
    const edges: layoutEdge[] = [];
    graph.edges.forEach((edge) => {
        const currEdge: layoutEdge = {
            ...edge,
            sourceIndex: nodes[edge.source].index,
            targetIndex: nodes[edge.target].index,
            x1: nodes[edge.source].cx,
            x2: nodes[edge.target].cx,
            y1: nodes[edge.source].cy,
            y2: nodes[edge.target].cy
        };
        edges.push(currEdge);
        nodes[edge.source].numEdges += 1;
        nodes[edge.target].numEdges += 1;
    });

    return {
        nodes: Object.values(nodes).sort((a, b) => a.index - b.index),
        edges,
        maxradius: Math.min(
            nodesLayer1Layout.maxradius,
            nodesLayer2Layout.maxradius
        )
    };
}
