import {egoGraph, egoGraphEdge, egoGraphNode} from "../../App.tsx";
import * as d3 from "d3";
import {polarToCartesian} from "../../UtilityFunctions.ts";

type layoutNode = egoGraphNode & {
    isCenter: boolean;
    cx: number;
    cy: number;
}
type layoutEdge = egoGraphEdge & {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
}

export interface egoGraphLayout {
    nodes: layoutNode[];
    edges: layoutEdge[];
}

export function calculateEgoLayout(graph: egoGraph, size: number) {
    const nodes: layoutNode[] = [];
    const edges: layoutEdge[] = [];
    const x = d3.scaleBand()
        .range([0, 360])
        .domain(graph.nodes.map(d => d.id))
    const maxradius: number = (((size / 2) / Math.sin(((180 - x.bandwidth()) / 2) * Math.PI / 180)) * Math.sin(x.bandwidth() * Math.PI / 180)) / 2;
    graph.nodes.forEach(node => {
        const nodeCoords = polarToCartesian(size / 2, size / 2, size / 2, x(node.id)!);
        const currNode: layoutNode = {...node, isCenter: false, cx: nodeCoords.x, cy: nodeCoords.y};
        nodes.push(currNode);
    })
    graph.edges.forEach((edge) => {
        const currEdge: layoutEdge = {
            ...edge,
            x1: nodes[edge.source].cx,
            x2: nodes[edge.target].cx,
            y1: nodes[edge.source].cy,
            y2: nodes[edge.target].cy
        };
        edges.push(currEdge);
    })
    nodes.forEach((node, i) => {
        edges.push({source: i, target: -1, x1: node.cx, y1: node.cy, x2: size / 2, y2: size / 2})
    })
    nodes.push({...graph.centerNode, isCenter: true, cx: size / 2, cy: size / 2})
    return {nodes, edges, maxradius}
}