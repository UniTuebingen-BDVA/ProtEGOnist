import { calculateOverlaps, getMaxIndex } from './egolayout.ts';
import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema.ts';

function sortNodes(egoGraphs: egoGraph[], intersections, sortBy) {
    const sortedNodes = {};
    const nodeDict = createNodeDict(egoGraphs);
    egoGraphs.forEach((egoGraph) => {
        const uniqueSorted = sortUniqueNodes(
            intersections[egoGraph.centerNode.originalID],
            egoGraph.edges,
            nodeDict,
            sortBy
        );
        sortedNodes[egoGraph.centerNode.originalID] = { unique: uniqueSorted };
    });
}


function createNodeDict(egoGraphs: egoGraph[]) {
    const nodeDict: { [key: string]: egoGraphNode } = {};
    egoGraphs.forEach((egoGraph) => {
        egoGraph.nodes.forEach((node) => (nodeDict[node.id] = node));
    });
    return nodeDict;
}

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
    return nodeAssignment;
}

function sortIntersectionByDistance(
    nodes: string[],
    currGraphId: string,
    otherGraphIds: string[],
    nodeDict: { [key: string]: egoGraphNode }
) {
    return nodes.sort((a, b) => {
        const centerDistComp =
            nodeDict[currGraphId + '_' + b].centerDist -
            nodeDict[currGraphId + '_' + a].centerDist;
        if (centerDistComp !== 0) {
            return centerDistComp;
        } else {
            const distanceA =
                nodeDict[currGraphId + '_' + a].centerDist +
                otherGraphIds.reduce(
                    (acc: number, curr: string) =>
                        acc + nodeDict[curr + '_' + a].centerDist,
                    0
                );
            const distanceB =
                nodeDict[currGraphId + '_' + b].centerDist +
                otherGraphIds.reduce(
                    (acc: number, curr: string) =>
                        acc + nodeDict[curr + '_' + b].centerDist,
                    0
                );
            const totalDistComp = distanceB - distanceA;
            if (totalDistComp !== 0) {
                return totalDistComp;
            } else {
                const numEdgeComp =
                    nodeDict[currGraphId + '_' + a].numEdges -
                    nodeDict[currGraphId + '_' + b].numEdges;
                if (numEdgeComp !== 0) {
                    return numEdgeComp;
                } else {
                    if (b > a) {
                        return 1;
                    } else {
                        return -1;
                    }
                }
            }
        }
    });
}
function sortUniqueNodes(
    nodeIds: string[],
    edges: egoGraphEdge[],
    nodeDict: { [key: string]: egoGraphNode },
    sortBy: string
) {
    if (sortBy === 'consistent') {
        const nodeAssignment = assignToInnerNodes(nodeDict, edges);
        const innerNodes = Object.keys(nodeAssignment);
        const intersectingNodes = calculateOverlaps(nodeAssignment, innerNodes);
        let innerNodeOrder: string[] = [];
        let outerNodeOrder: string[] = [];
        if (intersectingNodes.length > 1) {
            const nodeOrder = sortByOverlap(
                intersectingNodes,
                nodeAssignment,
                innerNodes
            );
            innerNodeOrder = nodeOrder.innerNodeOrder;
            outerNodeOrder = nodeOrder.outerNodeOrder;
        } else {
            const allOuterOrder: string[] = Array.from(
                nodeAssignment.values()
            ).flat();
            outerNodeOrder = [...new Set(allOuterOrder)];
        }
        const nodesLayer1 = nodeIds.filter((d) => nodeDict[d].centerDist === 1);
        const nodesLayer2 = nodeIds.filter((d) => nodeDict[d].centerDist === 2);
        nodesLayer1.forEach((d) => {
            if (!innerNodeOrder.includes(d)) {
                innerNodeOrder.push(d);
            }
        });
        nodesLayer2.forEach((d) => {
            if (!outerNodeOrder.includes(d)) {
                outerNodeOrder.push(d);
            }
        });
        return {
            innerNodes: nodeIds.filter((d) => innerNodeOrder.includes(d)),
            outerNodes: nodeIds.filter((d) => outerNodeOrder.includes(d))
        };
    } else {
        const sortedNodeIds = nodeIds.sort(
            (a, b) => nodeDict[a].numEdges - nodeDict[b].numEdges
        );
        const outerNodes = sortedNodeIds.filter(
            (d) => nodeDict[d].centerDist === 2
        );
        const innerNodes = sortedNodeIds.filter(
            (d) => nodeDict[d].centerDist === 1
        );
        return {
            innerNodes: innerNodes,
            outerNodes: outerNodes
        };
    }
}

function sortByOverlap(
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
    const nodeAssignmentInner0 = nodeAssignment.get(
        innerNodes[innerNodeOrder[0]]
    );
    outerNodeOrder.push(
        ...nodeAssignmentInner0.filter((d) => !intersection.includes(d))
    );
    outerNodeOrder.push(...intersection);
    const nodeAssignmentInner1 = nodeAssignment.get(
        innerNodes[innerNodeOrder[1]]
    );
    outerNodeOrder.push(
        ...nodeAssignmentInner1.filter((d) => !outerNodeOrder.includes(d))
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
        const nodeAssignmentInner = nodeAssignment.get(innerNodes[index]);
        const otherNodes = nodeAssignmentInner.filter(
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
