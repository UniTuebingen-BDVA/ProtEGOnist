import { atom } from 'jotai';
import {
    egoNetworkNetwork
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
    let allSizes = get(egoNetworkNetworksOverviewAtom).nodes.map(d=>d.size)
    let max = d3.max(allSizes)
    let min = d3.min(allSizes)
    return({scale:d3.scaleLinear().domain([min, max]).range([5, 100])})
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
    // for (let i = 0; i < 100; i++) {
        forceLayout.tick(100);
        forceLayout.force('boxing', boxingForce)
                    .force('collision',d3.forceCollide().radius((d) => 1.5 * scaleSize.scale(d.size)).iterations(4)
            ).tick(100);
        function bounded(node) {
            const radius = scaleSize.scale(node.size) ;
            console.log(radius)
            const blockX = svgSize.width - 2*radius;
            const blockY = svgSize.height - 2*radius;
            // Of the positions exceed the box, set them to the boundary position.
            // You may want to include your nodes width to not overlap with the box.
            node.x = Math.max(radius, Math.min(blockX, node.x));
            console.log(node.x)
            node.y = Math.max(radius, Math.min(blockY, node.y));
            console.log(node.y)
        }
        function boxingForce() {
            const svgSize = get(egoNetworkNetworkSizeAtom);

            for (let node of outNodes) {
                const radius = scaleSize.scale(node.size) ;
                console.log(radius)
                const blockX = svgSize.width - 2*radius;
                const blockY = svgSize.height - 2*radius;
                // Of the positions exceed the box, set them to the boundary position.
                // You may want to include your nodes width to not overlap with the box.
                node.x = Math.max(radius, Math.min(blockX, node.x));
                console.log(node.x)
                node.y = Math.max(radius, Math.min(blockY, node.y));
                console.log(node.y)
            }
        }
        outNodes.forEach((d) => {
            bounded(d);
        });
    // }
    // forceLayout
    return { nodes: outNodes, edges: outEdges };
});

