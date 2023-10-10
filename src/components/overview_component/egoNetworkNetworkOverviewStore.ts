import { atom } from 'jotai';
import {  egoNetworkNetworkNode, egoNetworkNetworkRendered } from '../../egoGraphSchema';
import * as d3 from 'd3';

export const egoNetworkNetworkSizeAtom = atom({
    width: 500,
    height: 500,
    x: 0,
    y: 0
});

export const highlightNodeAtom = atom<string>('');

export const egoNetworkNetworkNodeSizeScaleAtom = atom({ scale: null });

export const scaleNodeSizeAtom = atom((get) => {
    const allSizes = get(egoNetworkNetworksOverviewAtom).nodes.map(
        (d) => d.size
    );
    const svgSize = get(egoNetworkNetworkSizeAtom);
    const max = d3.max(allSizes);
    const min = d3.min(allSizes);
    return d3
        .scaleLinear()
        .domain([min, max])
        .range([
            Math.PI * 7 ** 2,
            Math.PI * (Math.min(svgSize.width, svgSize.height) * 0.07) ** 2
        ]);
});

export const egoNetworkNetworksOverviewAtom = atom<egoNetworkNetworkRendered>({
    nodes: [],
    edges: []
});

export const aggregateNetworkAtom = atom((get) => {
    const egoNetworkNetwork = get(egoNetworkNetworksOverviewAtom);
    const outNodes = egoNetworkNetwork.nodes;
    const outEdges = egoNetworkNetwork.edges;
    const svgSize = get(egoNetworkNetworkSizeAtom);

    const scaleSize = get(scaleNodeSizeAtom);

    const forceLayout = d3
        .forceSimulation(outNodes)
        .force('center', d3.forceCenter(svgSize.width / 2, svgSize.height / 2))
        .force(
            'charge',
            d3.forceManyBody().strength(() => -50)
        )
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d:egoNetworkNetworkNode) => d.id)
                .distance(
                    (d) =>
                        10 *
                            (Math.sqrt(scaleSize(d.source.size) / Math.PI) +
                                Math.sqrt(scaleSize(d.target.size) / Math.PI)) +
                        100 * (1 - d.weight)
                )
        )
        .stop();
    forceLayout.tick(100);
    forceLayout
        .force('boxing', boxingForce)
        .force(
            'collision',
            d3
                .forceCollide()
                .radius((d: egoNetworkNetworkNode) => 1.75 * Math.sqrt(scaleSize(d.size) / Math.PI))
                .iterations(10)
        )
        .tick(100);

    function boxingForce() {
        outNodes.forEach((node) => {
            //node = blockNodeCoordinates(scaleSize, node, svgSize);
            blockNodeCoordinates(scaleSize, node, svgSize);
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

function blockNodeCoordinates(
    scaleSize: d3.ScaleLinear<number, number, never>,
    node: egoNetworkNetworkNode,
    svgSize: { width: number; height: number; x: number; y: number }
) {
    // This code is for keeping the nodes within the svg canvas.
    // The size of the nodes is scaled using a d3 scale function.
    //The blockX and blockY variables are used to set the boundaries of the nodes.
    //The node.x and node.y variables are set to be within the bounds of the svg canvas.

    const radius = Math.sqrt(scaleSize(node.size) / Math.PI);
    const blockX = svgSize.width - 2 * radius;
    const blockY = svgSize.height - 2 * radius;

    node.x = Math.max(radius, Math.min(blockX, node.x));
    node.y = Math.max(radius, Math.min(blockY, node.y));
    //return node;
}
