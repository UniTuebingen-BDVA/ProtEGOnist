import { atom } from 'jotai';
import {
    egoNetworkNetwork, egoNetworkNetworkNode
} from '../../egoGraphSchema';
import * as d3 from 'd3';


export const egoNetworkNetworkSizeAtom = atom({
    width: 500,
    height: 500,
    x: 0,
    y: 0
});

export const egoNetworkNetworkNodeSizeScaleAtom = atom({scale: null})

export const scaleNodeSizeAtom = atom(
    (get) => {
    const svgSize = get(egoNetworkNetworkSizeAtom);
    let allSizes = get(egoNetworkNetworksOverviewAtom).nodes.map(d=>d.size)
    let max = d3.max(allSizes)
    let min = d3.min(allSizes)
    return({scale:d3.scaleLinear().domain([min, max]).range([5, Math.min(svgSize.width, svgSize.height)*0.1])})
    }
);

export const egoNetworkNetworksOverviewAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});

export const aggregateNetworkAtom = atom((get) => {
    const egoNetworkNetwork = get(egoNetworkNetworksOverviewAtom);
    const outNodes = egoNetworkNetwork.nodes
    const outEdges = egoNetworkNetwork.edges
    const svgSize = get(egoNetworkNetworkSizeAtom);

    const scaleSize = get(scaleNodeSizeAtom)

    const forceLayout = d3
        .forceSimulation(outNodes)
        // .alpha(1).alphaDecay(0.01)
        .force('center', d3.forceCenter( svgSize.width/2, svgSize.height/2))
        .force('charge', d3.forceManyBody().strength((d) => -50))
        .force('link', d3.forceLink(outEdges)
                          .id((d) => d.id).distance((d) => 1.5*(scaleSize.scale(d.source.size) +scaleSize.scale(d.target.size)) + (25 * (1 - d.weight)))
                )
       
        .stop();
        forceLayout.tick(100);
        forceLayout.force('boxing', boxingForce)
                    .force('collision',d3.forceCollide().radius((d) =>  1.75*scaleSize.scale(d.size)).iterations(10)
            ).tick(100);

        function boxingForce() {
            outNodes.forEach((node) => {             
                node = blockNodeCoordinates(scaleSize, node, svgSize);
            });
        }

        // Reforce the Coordinate Blocking
        outNodes.forEach((node) => {
            blockNodeCoordinates(scaleSize, node, svgSize);
        });
    // }
    // forceLayout
    return { nodes: outNodes, edges: outEdges };
});

function blockNodeCoordinates(scaleSize: { scale: d3.ScaleLinear<number, number, never>; }, node: egoNetworkNetworkNode, svgSize: { width: number; height: number; x: number; y: number; }) {
    // This code is for keeping the nodes within the svg canvas. 
    // The size of the nodes is scaled using a d3 scale function. 
    //The blockX and blockY variables are used to set the boundaries of the nodes. 
    //The node.x and node.y variables are set to be within the bounds of the svg canvas.

    const radius = scaleSize.scale(node.size);
    const blockX = svgSize.width - 2 * radius;
    const blockY = svgSize.height - 2 * radius;

    node.x = Math.max(radius, Math.min(blockX, node.x));
    node.y = Math.max(radius, Math.min(blockY, node.y));
    return node;
}
