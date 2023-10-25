import * as d3 from 'd3';
import { polarToCartesian } from '../../UtilityFunctions';
import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema';
import { midPointPolar2PI } from '../../UtilityFunctions';

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
    alwaysDraw: boolean;
    id: string;
    sourceIndex: number;
    targetIndex: number;
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};

export interface egoGraphLayout {
    bandData: {};
    nodes: layoutNode[];
    edges: layoutEdge[];
    identityEdges: identityEdge[];
    firstAndLastNodes: {
        [key: string]: {
            [key: string]: string[];
        };
    };
    radii: { [key: string]: number };
    centers: { x: number; y: number; id: string }[];
}
/**
 * Calculates the needed radius for the ego graph such that the nodes are not overlapping and evenly distributed
 */
function calculateRadius(amount: number, nodeSize = 5) {
    const radius = (amount * nodeSize * 1) / (2 * Math.PI);

    console.log(amount);
    console.log(radius);
    return Math.max(radius, 50);
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
    sortOrder: {
        id: string;
        intersections: string[];
    }[],
    center: number,
    radius: number,
    xRange: [number, number], // full circle: 0, 2PI
    transformVector: { graphId: string; x: number; y: number },
    offset: number
) {
    let internalOffset = offset;
    const nodes: { [key: string]: layoutNode } = {};
    const x = d3
        .scaleBand()
        .range(xRange)
        .domain(sortOrder.map((d) => d.intersections).flat());
    // let maxradius: number;
    // if (layerNodes.length > 1) {
    //     maxradius =
    //         ((center / Math.sin((Math.PI - x.bandwidth()) / 2)) *
    //             Math.sin(x.bandwidth())) /
    //         2;
    // } else {
    //     maxradius = radius;
    // }

    // check if any element in sortOrder has an id sortOrder[i].id.split(',').length > 2
    const tripleIntersection = sortOrder.find(
        (d) => d.id.split(',').length > 2
    );
    // if such an element is found calculate the midpoint of the two outer nodes
    if (tripleIntersection) {
        const firstNode = tripleIntersection.intersections[0];
        const lastNode =
            tripleIntersection.intersections[
                tripleIntersection.intersections.length - 1
            ];
        const firstNodeTheta = x(firstNode);
        const lastNodeTheta = x(lastNode) + x.bandwidth();
        internalOffset -= midPointPolar2PI(firstNodeTheta, lastNodeTheta);
    } else {
        internalOffset += 0;
    }
    const bands: {
        [key: string]: [
            { x: number; y: number },
            { x: number; y: number },
            string,
            { graphId: string; x: number; y: number }
        ];
    } = {};
    for (let i = 0; i < sortOrder.length; i++) {
        const start = polarToCartesian(
            center,
            center,
            radius,
            x(sortOrder[i].intersections[0]),
            internalOffset
        );
        start.x += transformVector.x;
        start.y += transformVector.y;
        const end = polarToCartesian(
            center,
            center,
            radius,
            x(
                sortOrder[i].intersections[
                    sortOrder[i].intersections.length - 1
                ]
            ) + x.bandwidth(),
            internalOffset
        );
        end.x += transformVector.x;
        end.y += transformVector.y;
        bands[sortOrder[i].id] = [
            start,
            end,
            transformVector.graphId,
            transformVector,
            x(sortOrder[i].intersections[0]),
            x(
                sortOrder[i].intersections[
                    sortOrder[i].intersections.length - 1
                ]
            ) + x.bandwidth()
        ];
    }
    layerNodes.forEach((node) => {
        const nodeCoords = polarToCartesian(
            center,
            center,
            radius,
            x(node.id)! + x.bandwidth() / 2,
            internalOffset
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

    return { nodes, bands };
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
    const nodeAssignment = new Map<string, string[]>();
    const assignedNodes = new Set<string>();
    for (let i = 0; i < edges.length; i++) {
        const edge = edges[i];
        const sourceId = edge.source;
        const targetId = edge.target;
        if (
            Object.prototype.hasOwnProperty.call(nodeDict, sourceId) &&
            Object.prototype.hasOwnProperty.call(nodeDict, targetId)
        ) {
            if (
                nodeDict[sourceId].centerDist === 1 &&
                !nodeAssignment.has(sourceId)
            ) {
                nodeAssignment.set(sourceId, []);
            }
            if (
                nodeDict[targetId].centerDist === 1 &&
                !nodeAssignment.has(targetId)
            ) {
                nodeAssignment.set(targetId, []);
            }
            if (
                nodeDict[sourceId].centerDist === 2 &&
                nodeDict[targetId].centerDist === 1 &&
                !assignedNodes.has(sourceId)
            ) {
                nodeAssignment.get(targetId)?.push(sourceId);
                assignedNodes.add(sourceId);
            } else if (
                nodeDict[targetId].centerDist === 2 &&
                nodeDict[sourceId].centerDist === 1 &&
                !assignedNodes.has(targetId)
            ) {
                nodeAssignment.get(sourceId)?.push(targetId);
                assignedNodes.add(targetId);
            }
        }
    }
    return nodeAssignment;
}

/**
 * calculates overlaps between inner nodes
 * @param { Map<string, string[]> } nodeAssignment - inner nodes with their assigned outer nodes
 * @param {string[]} keys: node ids
 */
export function calculateOverlaps(
    nodeAssignment: Map<string, string[]>,
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
 * @param { Map<string, string[]>} nodeAssignment
 * @param {string[]} innerNodes
 */
export function sortByOverlap(
    intersectingNodes: string[][][],
    nodeAssignment: Map<string, string[]>,
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
    nodes.sort((a, b) => {
        if (
            nodeDict[graphID + '_' + a].numEdges >
            nodeDict[graphID + '_' + b].numEdges
        ) {
            return 1;
        } else if (
            nodeDict[graphID + '_' + a].numEdges <
            nodeDict[graphID + '_' + b].numEdges
        ) {
            return -1;
        } else {
            if (a > b) {
                return 1;
            } else {
                return -1;
            }
        }
    });
    return nodes;
}
function calculateXRanges(proportion: number, toggle: boolean) {
    const fullRange = 2 * Math.PI;
    if (toggle) {
        return [
            [0, fullRange * proportion],
            [fullRange * proportion, fullRange]
        ];
    }
    return [
        [0, fullRange - 0.0001],
        [fullRange - 0.0001, fullRange]
    ];
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
    innerSize: number,
    outerSize: number,
    decollapseMode: string
) {
    // sort each array in egoGraphs alphabetically by centerNode originalId
    egoGraphs.sort((a, b) => {
        if (a.centerNode.originalID > b.centerNode.originalID) {
            return 1;
        } else if (a.centerNode.originalID < b.centerNode.originalID) {
            return -1;
        } else {
            return 0;
        }
    });
    console.log('MODE', decollapseMode);
    // get the amount of intersecting nodes for each egoGraph
    const decollapsedRadii: { [key: string]: number } = {};
    const sharedNonShared: {
        [key: string]: { shared: number; unique: number };
    } = {};
    egoGraphs.forEach((egoGraph) => {
        let idAccumulator = 0;
        let shared = 0;
        for (const [key, value] of Object.entries(intersections)) {
            const ke = key.split(',');
            const addCond = ke.length > 1 || egoGraphs.length === 1; //add only shared cond here
            if (addCond && ke.includes(egoGraph.centerNode.originalID)) {
                idAccumulator += value.length;
                shared += value.length;
            }
            if (
                decollapseMode === 'all' &&
                ke.includes(egoGraph.centerNode.originalID)
            ) {
                idAccumulator += value.length;
            }
        }
        sharedNonShared[egoGraph.centerNode.originalID] = {
            shared,
            unique: idAccumulator - shared
        };
        decollapsedRadii[egoGraph.centerNode.originalID] =
            calculateRadius(idAccumulator);
    });

    console.log('intersectingNodesAmounts', intersections);
    if (egoGraphs.length > 1) {
        const graphCenters: {
            x: number;
            y: number;
            id: string;
            outerSize: number;
        }[] = [];
        const scaledOuterSizes: number[] = [];
        const layout: egoGraphLayout = {
            bandData: {},
            nodes: [],
            edges: [],
            identityEdges: [],
            radii: decollapsedRadii,
            centers: []
        };
        const fullRange = 2 * Math.PI;

        let layoutNodeDict: { [key: string]: layoutNode } = {};
        let nodeDict: { [key: string]: egoGraphNode } = {};
        egoGraphs[egoGraphs.length - 1].nodes.forEach(
            (node) => (nodeDict[node.id] = node)
        );
        let pairwiseIntersectionId = [
            egoGraphs[egoGraphs.length - 1].centerNode.originalID,
            egoGraphs[0].centerNode.originalID
        ]
            .sort()
            .toString();
        let pairwiseIntersections = sortPairwiseIntersection(
            intersections[pairwiseIntersectionId],
            nodeDict,
            egoGraphs[egoGraphs.length - 1].centerNode.originalID
        ); //.reverse();
        const firstAndLastNodesIDs = {};
        for (let i = 0; i < egoGraphs.length; i++) {
            nodeDict = {};
            egoGraphs[i].nodes.forEach((node) => (nodeDict[node.id] = node));
            console.log('id', egoGraphs[i].centerNode.originalID);
            const firstGraphId = egoGraphs[i].centerNode.originalID;
            let secondGraphId;
            if (i === egoGraphs.length - 1) {
                secondGraphId = egoGraphs[0].centerNode.originalID;
            } else {
                secondGraphId = egoGraphs[i + 1].centerNode.originalID;
            }
            const intersectingNodes: { id: string; intersections: string[] }[] =
                [];
            const nextPairwiseIntersectionsId = [firstGraphId, secondGraphId]
                .sort()
                .toString();
            let nextPairwiseIntersections =
                intersections[nextPairwiseIntersectionsId];
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
                )
                .sort();
            let otherIntersectionsId = '';
            if (egoGraphs.length > 2) {
                otherIntersectionsId = [
                    ...egoGraphs.map((d) => d.centerNode.originalID)
                ]
                    .sort()
                    .toString();
            }
            if (pairwiseIntersections.length > 0) {
                intersectingNodes.push({
                    id: pairwiseIntersectionId,
                    intersections: pairwiseIntersections
                });
            }
            if (otherIntersections.length > 0) {
                intersectingNodes.push({
                    id: otherIntersectionsId,
                    intersections: otherIntersections
                });
            }
            if (nextPairwiseIntersections.length > 0 && egoGraphs.length > 2) {
                intersectingNodes.push({
                    id: nextPairwiseIntersectionsId,
                    intersections: nextPairwiseIntersections
                });
            }
            pairwiseIntersections = nextPairwiseIntersections;
            const scaledOuterSize = decollapsedRadii[firstGraphId];
            const largestRadius = Math.max(...Object.values(decollapsedRadii));
            if (egoGraphs.length <= 2) {
                const nodeSize = largestRadius * 2.5;
                if (i === 0) {
                    graphCenters.push({
                        x: largestRadius - nodeSize / 2,
                        y: nodeSize / 2,
                        id: egoGraphs[i].centerNode.originalID,
                        outerSize: scaledOuterSize
                    });
                } else {
                    graphCenters.push({
                        x: nodeSize + nodeSize / 2 - largestRadius,
                        y: nodeSize / 2,
                        id: egoGraphs[i].centerNode.originalID,
                        outerSize: scaledOuterSize
                    });
                }
            } else {
                console.log('3case');
                const nodeSize = largestRadius * 2.5;

                const points = [
                    polarToCartesian(
                        nodeSize / 2,
                        nodeSize / 2,
                        nodeSize - scaledOuterSize,
                        0,
                        Math.PI
                    ),
                    polarToCartesian(
                        nodeSize / 2,
                        nodeSize / 2,
                        nodeSize - scaledOuterSize,
                        (1 / 3) * (2 * Math.PI),
                        Math.PI
                    ),
                    polarToCartesian(
                        nodeSize / 2,
                        nodeSize / 2,
                        nodeSize - scaledOuterSize,
                        (2 / 3) * (2 * Math.PI),
                        Math.PI
                    )
                ];
                graphCenters.push({
                    x: points[i].x,
                    y: points[i].y,
                    id: egoGraphs[i].centerNode.originalID,
                    outerSize: scaledOuterSize
                });
            }
            const proportion =
                sharedNonShared[firstGraphId].shared /
                (sharedNonShared[firstGraphId].shared +
                    sharedNonShared[firstGraphId].unique);
            const currLayout = calculateMultiLayout(
                egoGraphs[i],
                scaledOuterSize / 2,
                scaledOuterSize,
                decollapseMode === 'shared'
                    ? []
                    : intersections[egoGraphs[i].centerNode.originalID], //todo need switching
                intersectingNodes.reverse(),
                graphCenters[i],
                calculateXRanges(proportion, decollapseMode !== 'shared'),
                //-fullRange / egoGraphs.length / 2 +
                (fullRange / egoGraphs.length) * i
            );

            console.log('CURRENT BANDS', currLayout.bands);
            Object.entries(currLayout.bands).forEach((entry) => {
                const key = entry[0];
                const entryValue = entry[1];
                if (key.includes(egoGraphs[i].centerNode.originalID)) {
                    if (!Object.keys(firstAndLastNodesIDs).includes(key)) {
                        firstAndLastNodesIDs[key] = [];
                    }
                    firstAndLastNodesIDs[key].push(entryValue);
                }
            });

            pairwiseIntersectionId = nextPairwiseIntersectionsId;

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
        layout.identityEdges = createIdentityEdges(layoutNodeDict);

        layout.nodes = Object.values(layoutNodeDict);
        layout.centers = graphCenters;
        const firstAndLastNodes = firstAndLastNodeIntersection(
            firstAndLastNodesIDs,
            layout.centers
        );
        layout.bandData = firstAndLastNodes;
        return layout;
    } else {
        return calculateEgoLayout(
            egoGraphs[0],
            decollapsedRadii[egoGraphs[0].centerNode.originalID] / 2,
            decollapsedRadii[egoGraphs[0].centerNode.originalID],
            decollapsedRadii[egoGraphs[0].centerNode.originalID]
        );
    }
}

function addCenterNodeId(
    centerId: string,
    intersectionNodes: {
        id: string;
        intersections: string[];
    }[]
): {
    id: string;
    intersections: string[];
}[] {
    const intersecionNodesClone = structuredClone(intersectionNodes);
    // add centerId to each intersections entry of each entry in intersectionNodes
    intersecionNodesClone.forEach((entry) => {
        entry.intersections = entry.intersections.map((intersection) => {
            return centerId + '_' + intersection;
        });
    });
    return intersecionNodesClone;
}

function firstAndLastNodeIntersection(
    firstAndLastNodeIds: { [key: string]: [string, string] },
    centers: { x: number; y: number; id: string; outerSize: number }[]
) {
    // for each graphCenter and each associated intersection (key contains the graphCenter) get the first and last node in the intersection as sorted in the nodeDict
    const firstAndLastNodes = {};
    Object.entries(firstAndLastNodeIds).forEach((entry) => {
        const key = entry[0];
        const entryValue = entry[1];
        // add firstLast=true property to firstNode and lastNode
        const graphCenterIds = key.split(',');
        if (entryValue) {
            graphCenterIds.forEach((graphCenterId, idx) => {
                //find correct entry in entryValue
                const bandData = entryValue.find(
                    (elem) => elem[2] === graphCenterId
                );
                const currentGraphCenter = centers.find(
                    (elem) => elem.id == graphCenterId
                );
                //check if key is in firstAndLastNodes
                if (!Object.keys(firstAndLastNodes).includes(key)) {
                    firstAndLastNodes[key] = {};
                }
                firstAndLastNodes[key][graphCenterId] = [
                    {
                        //id: firstNode.id,
                        graphCenterPos: currentGraphCenter,
                        pos: {
                            x: bandData[0].x,
                            y: bandData[0].y
                        }
                    },
                    {
                        //id: lastNode.id,
                        graphCenterPos: currentGraphCenter,
                        pos: {
                            x: bandData[1].x,
                            y: bandData[1].y
                        }
                    }
                ];
            });
        }
    });
    return firstAndLastNodes;
}

function calculateMultiLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number,
    uniqueNodeIds: string[],
    sharedNodeIds: {
        id: string;
        intersections: string[];
    }[],
    graphCenter: { x: number; y: number; id: string },
    xRanges: [[number, number], [number, number]],
    offset: number
) {
    const transformVector = {
        graphId: graphCenter.id,
        x: graphCenter.x - outerSize,
        y: graphCenter.y - outerSize
    };
    const nodeDict: { [key: string]: egoGraphNode } = {};
    graph.nodes.forEach((node) => (nodeDict[node.id] = node));
    let nodes: { [key: string]: layoutNode };
    const nodeIdsFlat = sharedNodeIds
        .map((d) =>
            d.intersections.map(
                (nodeId) => nodeDict[graph.centerNode.originalID + '_' + nodeId]
            )
        )
        .flat();
    const sharedNodesLayout = calculateLayoutSharedNodes(
        nodeIdsFlat,
        addCenterNodeId(graph.centerNode.originalID, sharedNodeIds),
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
        maxradius: maxRadius,
        bands: sharedNodesLayout.bands
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
    sortOrder: {
        id: string;
        intersections: string[];
    }[],
    center: number,
    radius: number,
    xRange: [number, number],
    factor: number,
    graphCenter: { graphId: string; x: number; y: number },
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
        if (nodeLayout.nodes[nodeId].centerDist < 2) {
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
        [{ id: 'layer1', intersections: innerNodeOrder }],
        outerSize,
        innerSize,
        xRange,
        transformVector,
        offset
    );
    const nodesLayer2Layout = createLayerNodes(
        nodesLayer2,
        [{ id: 'layer2', intersections: outerNodeOrder }],
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
 */

function createIdentityEdges(nodeDict: {
    [key: string]: layoutNode;
}): identityEdge[] {
    const proteinNodes = new Map<string, layoutNode[]>();
    for (const node of Object.values(nodeDict)) {
        const proteinId = node.id.split('_')[1];
        if (!proteinNodes.has(proteinId)) {
            proteinNodes.set(proteinId, []);
        }
        proteinNodes.get(proteinId)?.push(node);
    }
    const edges: identityEdge[] = [];
    const edgeIds = new Set<string>();
    for (const nodes of proteinNodes.values()) {
        const nodeIds = nodes.map((node) => node.id);
        for (const nodeId of nodeIds) {
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
        }
        const layer1Nodes = nodeIds.filter(
            (nodeId) => nodeDict[nodeId].centerDist < 2
        );
        if (nodeIds.length > 1) {
            for (let i = 0; i < nodeIds.length; i++) {
                for (let j = i + 1; j < nodeIds.length; j++) {
                    // don't draw an edge if the nodes are first layer nodes but not pseudo
                    let firstId = nodeIds[i];
                    let secondId = nodeIds[j];
                    const drawEdge = firstId != secondId;
                    if (Object.keys(nodeDict).includes(firstId + '_pseudo')) {
                        firstId = firstId + '_pseudo';
                    }
                    if (Object.keys(nodeDict).includes(secondId + '_pseudo')) {
                        secondId = secondId + '_pseudo';
                    }
                    //check if both nodes have centerDist 2

                    if (firstId !== secondId) {
                        // exclude self-edges
                        const edgeId = firstId + '_' + secondId;
                        if (!edgeIds.has(edgeId)) {
                            edges.push({
                                alwaysDraw: drawEdge,
                                sourceIndex: nodeDict[firstId].index,
                                targetIndex: nodeDict[secondId].index,
                                id: edgeId,
                                x1: nodeDict[firstId].cx,
                                y1: nodeDict[firstId].cy,
                                x2: nodeDict[secondId].cx,
                                y2: nodeDict[secondId].cy
                            });
                            edgeIds.add(edgeId);
                        }
                    }
                }
            }
            for (const nodeId of layer1Nodes) {
                const edgeId = nodeId + '_' + nodeId + '_pseudo';
                if (!edgeIds.has(edgeId)) {
                    edges.push({
                        alwaysDraw: false,
                        sourceIndex: nodeDict[nodeId].index,
                        targetIndex: nodeDict[nodeId + '_pseudo'].index,
                        id: edgeId,
                        x1: nodeDict[nodeId].cx,
                        y1: nodeDict[nodeId].cy,
                        x2: nodeDict[nodeId + '_pseudo'].cx,
                        y2: nodeDict[nodeId + '_pseudo'].cy
                    });
                    edgeIds.add(edgeId);
                }
            }
        }
    }
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
        const sourceId = edge.sources;
        const targetId = edge.target;
        //check if both source and target are in nodeDict
        if (
            Object.keys(nodeDict).includes(sourceId) &&
            Object.keys(nodeDict).includes(targetId)
        ) {
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
        }
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
 * @param {number} nodeSize
 */
export function calculateEgoLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number,
    nodeSize: number
) {
    const { nodesLayer1Layout, nodesLayer2Layout } = calculateLayoutUniqueNodes(
        graph.nodes,
        graph.edges,
        innerSize,
        outerSize,
        [0, 2 * Math.PI],
        { x: nodeSize / 2 - outerSize, y: nodeSize / 2 - outerSize },
        0
    );
    const nodes = { ...nodesLayer1Layout.nodes, ...nodesLayer2Layout.nodes };
    // add inner node to layout at center position
    nodes[graph.centerNode.id] = createCenterNode(
        graph.nodes[graph.nodes.map((d) => d.id).indexOf(graph.centerNode.id)],
        outerSize,
        { x: nodeSize / 2 - outerSize, y: nodeSize / 2 - outerSize }
    );
    Object.values(nodes).forEach((elem, index) => {
        elem.index = index;
        elem.identityNodes = [index];
    });
    const edges = createEgoEdges(nodes, graph.edges);
    return {
        nodes: Object.values(nodes).sort((a, b) => a.index - b.index),
        edges,
        identityEdges: [],
        radii: { [graph.centerNode.originalID]: outerSize },
        centers: [
            {
                x: nodeSize / 2,
                y: nodeSize / 2,
                id: graph.centerNode.originalID
            }
        ]
    };
}
