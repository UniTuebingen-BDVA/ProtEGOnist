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
        (center / Math.sin((Math.PI - x.bandwidth()) / 2) *
            Math.sin(x.bandwidth())) /
        2;
    layerNodes.forEach((node) => {
        const nodeCoords = polarToCartesian(
            center,
            center,
            radius,
            x(node.id)!
        );
        const currNode: layoutNode = {
            ...node,
            index: -1,
            isCenter: false,
            cx: nodeCoords.x,
            cy: nodeCoords.y,
            hovered: false,
            numEdges: 0
        };
        nodes[node.id] = currNode;
    });
    return { nodes, maxradius };
}

export function calculateEgoLayout(
    graph: egoGraph,
    innerSize: number,
    outerSize: number
): egoGraphLayout {
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
