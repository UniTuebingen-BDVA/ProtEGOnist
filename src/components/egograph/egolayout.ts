import * as d3 from 'd3';
import { polarToCartesian } from '../../UtilityFunctions.ts';
import { egoGraph, egoGraphEdge, egoGraphNode } from '../../egoGraphSchema.ts';

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

function createLayerNodes(
    layerNodes: egoGraphNode[],
    center: number,
    radius: number
) {
    const nodes: { [key: string]: layoutNode } = {};
    const x = d3
        .scaleBand()
        .range([0, 2 * Math.PI])
        .domain(layerNodes.map((d) => d.id));
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
        }
        if (
            nodeDict[edge.target].centerDist === 2 &&
            nodeDict[edge.source].centerDist === 1
        ) {
            nodeAssignment[edge.source].push(edge.target);
        }
    });
    return nodeAssignment;
}

function calculateOverlaps(nodeAssignment: { [key: string]: string[] }) {
    const keys = Object.keys(nodeAssignment);
    /*
    const intersections: { [key: string]: string[] } = {};
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            intersections[keys[i] + ',' + keys[j]] = nodeAssignment[
                keys[i]
                ].filter((value) => nodeAssignment[keys[j]].includes(value));
        }
    }*/
    const intersections: number[][] = Array(keys.length)
        .fill()
        .map(() => Array<number>(keys.length).fill(-1));
    for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
            intersections[i][j] = nodeAssignment[keys[i]].filter((value) =>
                nodeAssignment[keys[j]].includes(value)
            ).length;
        }
    }
    return intersections;
}

function getMaxIndices(matrix: number[][]) {
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

function sortInnerNodes(intersections:number[][]) {
    let maxIndex = getMaxIndices(intersections);
    const nodeOrder = [maxIndex[0], maxIndex[1]];
    while (nodeOrder.length < intersections.length) {
        let localMax = -1;
        let left = true;
        intersections[maxIndex[0]][maxIndex[1]]=-1
        for (let i = 0; i < intersections.length; i++) {
            //search for next highest number in columns and rows corresponding to maxIndex
            if (localMax < intersections[i][nodeOrder[0]]) {
                localMax = intersections[i][nodeOrder[0]];
                maxIndex = [i, nodeOrder[0]];
                left = true;
            }
            if (localMax < intersections[nodeOrder[nodeOrder.length-1]][i]) {
                localMax = intersections[nodeOrder[nodeOrder.length-1]][i];
                maxIndex = [maxIndex[0], i];
                left = false;
            }
        }
        if (left) {
            nodeOrder.unshift(maxIndex[0]);
            for (let i = 0; i < intersections.length; i++) {
                intersections[i][nodeOrder[1]] = -1;
                intersections[nodeOrder[1]][i] = -1;
            }
        } else {
            nodeOrder.push(maxIndex[1]);
            for (let i = 0; i < intersections.length; i++) {
                intersections[i][nodeOrder[nodeOrder.length-2]] = -1;
                intersections[nodeOrder[nodeOrder.length-2]][i] = -1;
            }
        }
    }
    return nodeOrder;
}

function sortNodes(nodes: egoGraphNode[], edges: egoGraphEdge[]) {
    const nodeDict: { [key: string]: egoGraphNode } = {};
    nodes.forEach((node) => (nodeDict[node.id] = node));
    const nodeAssignment = assignToInnerNodes(nodeDict, edges);
    const intersections = calculateOverlaps(nodeAssignment);
    console.log(sortInnerNodes(intersections));
}

export function calculateEgoLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number
): egoGraphLayout {
    sortNodes(graph.nodes, graph.edges);
    const nodesLayer1 = graph.nodes.filter((d) => d.centerDist === 1);
    const nodesLayer2 = graph.nodes.filter((d) => d.centerDist === 2);
    const nodesLayer1Layout = createLayerNodes(
        nodesLayer1,
        outerSize,
        innerSize
    );
    const nodesLayer2Layout = createLayerNodes(
        nodesLayer2,
        outerSize,
        outerSize
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
