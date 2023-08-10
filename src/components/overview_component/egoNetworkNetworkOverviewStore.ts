import { atom } from 'jotai';
import {
    egoNetworkNetwork
} from '../../egoGraphSchema';
import * as d3 from 'd3';


export const egoNetworkNetworkSizeAtom = atom({
    width: 1000,
    height: 1000,
    x: 0,
    y: 0
});

export const egoNetworkNetworkNodeSizeScaleAtom = atom({scale: d3.scaleLinear().domain([0, 1]).range([0, 5])})

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
        // .force('charge', d3.forceManyBody().strength((d) => -200).distanceMax(svgSize.width / 2))
        .force(
            'collision',
            d3.forceCollide().radius((d) => 4 * scaleSize.scale(d.size))
        )
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d) => d.id)
                .distance((d) => 10 + (25 * (1 - d.weight)))

                
        )
        .force('center', d3.forceCenter(500 , 500))
        .force('x', d3.forceX(svgSize.width/2).strength(0.2))
        .force('y', d3.forceY(svgSize.height/2).strength(0.8))
    for (let i = 0; i < 100; i++) {
        forceLayout.tick();
    }
    // forceLayout
    return { nodes: outNodes, edges: outEdges };
});
