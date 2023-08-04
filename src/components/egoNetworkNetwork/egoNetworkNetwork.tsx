import { useAtom } from 'jotai';
import {
    decollapseIDsAtom,
    egoNetworkNetworksAtom
} from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import * as d3 from 'd3';
import {
    egoNetworkNetworkEdge,
    egoNetworkNetworkNode
} from '../../egoGraphSchema.ts';
import EgoGraphBundle from '../egograph/egoGraphBundle.tsx';
import { bundleGroupSizeAtom } from '../egograph/egoGraphBundleStore.ts';
import { a, useTransition } from '@react-spring/web';

const EgoNetworkNetwork = () => {
    const [aggregateEgoNetworkNodeIDs, setAggregateEgoNetworkNodeIDs] =
        useAtom(decollapseIDsAtom);
    const [egoNetworkNetwork, getEgoNetworkNetwork] = useAtom(
        egoNetworkNetworksAtom
    );
    const [bundleGroupSize] = useAtom(bundleGroupSizeAtom);

    const { outNodes, outEdges } = aggregateEgoNetworkNodes(
        egoNetworkNetwork.nodes,
        egoNetworkNetwork.edges,
        aggregateEgoNetworkNodeIDs
    );

    const forceLayout = d3
        .forceSimulation(outNodes)
        .force('charge', d3.forceManyBody().strength(-100))
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d) => d.id)
                .distance(50)
        )
        .force('center', d3.forceCenter(0, 0))
        .force(
            'collision',
            d3.forceCollide().radius((d) => d.size)
        );
    forceLayout.stop();
    for (let i = 0; i < 100; i++) {
        forceLayout.tick();
    }

    const transitionsNodes = useTransition(outNodes, {
        keys: ({ id }) => id,
        from: ({ x, y }, index) => ({
            x: 0,
            y: 0
        }),
        enter:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
                    x: x,
                    y: y
                });
            },
        leave:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
                    x: x,
                    y: y
                });
            },
        config: { duration: 2000 }
    });
    const transitionsEdges = useTransition(outEdges, {
        keys: ({ source, target }) => source.id + '+' + target.id,
        from: ({ source, target }, index) => {
            const sourceNode = outNodes.find((node) => node.id === source.id);

            const targetNode = outNodes.find((node) => node.id === target.id);
            return {
                x1: sourceNode?.x,
                y1: sourceNode?.y,
                x2: targetNode?.x,
                y2: targetNode?.y
            };
        },
        enter:
            ({ source, target }, index) =>
            async (next, cancel) => {
                const sourceNode = outNodes.find(
                    (node) => node.id === source.id
                );

                const targetNode = outNodes.find(
                    (node) => node.id === target.id
                );
                await next({
                    x1: sourceNode?.x,
                    y1: sourceNode?.y,
                    x2: targetNode?.x,
                    y2: targetNode?.y
                });
            },
        leave:
            ({ source, target }, index) =>
            async (next, cancel) => {
                const sourceNode = outNodes.find(
                    (node) => node.id === source.id
                );

                const targetNode = outNodes.find(
                    (node) => node.id === target.id
                );
                await next({
                    x1: sourceNode?.x,
                    y1: sourceNode?.y,
                    x2: targetNode?.x,
                    y2: targetNode?.y
                });
            },
        config: { duration: 2000 }
    });

    return (
        <g>
            {transitionsEdges((style, edge) => {
                return (
                    <EgoNetworkNetworkEdge
                        key={edge.source.id + '+' + edge.target.id}
                        source={edge.source}
                        target={edge.target}
                        weight={edge.weight}
                        x1={style.x1}
                        y1={style.y1}
                        x2={style.x2}
                        y2={style.y2}
                    />
                );
            })}

            {transitionsNodes((style, node) => {
                if (!node.collapsed) {
                    console.log(node);
                    return (
                        <EgoGraphBundle
                            x={style.x - bundleGroupSize.width / 2}
                            y={style.y - bundleGroupSize.height / 2}
                            nodeId={node.id}
                        />
                    );
                } else
                    return (
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={node.size}
                            x={style.x}
                            y={style.y}
                            color={'red'}
                        />
                    );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;

function aggregateEgoNetworkNodes(
    egoNetworkNodesNodes: egoNetworkNetworkNode[],
    egoNetworkNetworkEdges: egoNetworkNetworkEdge[],
    aggregateNodeIDs: string[][]
): { outNodes: egoNetworkNetworkNode[]; outEdges: egoNetworkNetworkEdge[] } {
    const outNodes: egoNetworkNetworkNode[] = [];
    const outEdges: egoNetworkNetworkEdge[] = [];
    for (const node of egoNetworkNodesNodes) {
        // check if any of the arrays in aggregateNodeIDs includes node.id
        if (
            !aggregateNodeIDs.some((aggregate) => aggregate.includes(node.id))
        ) {
            outNodes.push({ ...node, collapsed: true });
        }
    }
    aggregateNodeIDs.forEach((aggregates, index) => {
        const aggregateID = aggregates.join(',');
        outNodes.push({
            id: aggregateID,
            name: aggregateID,
            size: 400,
            x: 0,
            y: 0,
            collapsed: false
        });

        // add all edges that do not have a source or target in aggregateNodeIDs to outEdges
        // instead of the edges that have a source or target in aggregateNodeIDs add a new edge to outEdges that targets the new node and has the sum of the weights of the edges as weight
        for (const edge of egoNetworkNetworkEdges) {
            if (
                !aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.source)
                ) &&
                !aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.target)
                )
            ) {
                outEdges.push(edge);
            } else {
                const weight = aggregates.reduce((acc, cur) => {
                    const currentEdge = egoNetworkNetworkEdges.find(
                        (edge) => edge.source === cur || edge.target === cur
                    );
                    const currentEdgeWeight = currentEdge
                        ? currentEdge.weight
                        : 0;
                    return acc + currentEdgeWeight;
                }, 0);
                //check which edges to add
                // no edges from aggregateNodeIDs to aggregateNodeIDs should be added
                // edges from aggregateNodeIDs to other nodes should be added
                // edges from other nodes to aggregateNodeIDs should be added

                const sourceInAggregate = aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.source)
                );
                const targetInAggregate = aggregateNodeIDs.some((aggregate) =>
                    aggregate.includes(edge.target)
                );

                if (!sourceInAggregate || !targetInAggregate) {
                    const newEdge: egoNetworkNetworkEdge = {
                        source: sourceInAggregate ? aggregateID : edge.source,
                        target: targetInAggregate ? aggregateID : edge.target,
                        weight: weight
                    };
                    if (
                        outEdges.every(
                            (edge) =>
                                (edge.source !== newEdge.source ||
                                    edge.target !== newEdge.target) &&
                                (edge.source !== newEdge.target ||
                                    edge.target !== newEdge.source)
                        )
                    ) {
                        outEdges.push(newEdge);
                    }
                }
            }
        }
    });
    return { outNodes: outNodes, outEdges: outEdges };
}
