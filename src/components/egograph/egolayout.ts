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

function calculateOverlaps(nodeAssignment:{ [key: string]: string[] }){
    const keys=Object.keys(nodeAssignment);
    const intersections:{[key:string]:string[]}={}
    for(let i=0; i<keys.length;i++){
        for(let j=i+1;j<keys.length;j++){
            intersections[keys[i] + ',' + keys[j]] = nodeAssignment[
                keys[i]
            ].filter((value) => nodeAssignment[keys[j]].includes(value));
        }
    }
    return intersections;
}
function sortInnerNodes(nodeAssignment){
    const intersections=calculateOverlaps(nodeAssignment);
    const intersectionKeys=Object.keys(intersections);
    intersectionKeys.sort((a,b)=>{
        
    })
}

function sortNodes(nodes: egoGraphNode[], edges: egoGraphEdge[]) {
    const nodeDict: { [key: string]: egoGraphNode } = {};
    nodes.forEach((node) => (nodeDict[node.id] = node));
    const nodeAssignment = assignToInnerNodes(nodeDict, edges);
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
