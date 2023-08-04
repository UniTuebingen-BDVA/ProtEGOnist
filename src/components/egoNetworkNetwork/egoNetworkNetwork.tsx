import { useAtom } from 'jotai';
import { egoNetworkNetworksAtom } from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import * as d3 from 'd3';
import {
    egoNetworkNetworkEdge,
    egoNetworkNetworkNode
} from '../../egoGraphSchema.ts';
import EgoGraphBundle from '../egograph/egoGraphBundle.tsx';
import { bundleGroupSizeAtom } from '../egograph/networkStore.ts';

interface egoNetworkNetworkNodeProps {
    aggregateEgoNetworkNodeIDs: string[];
}

const EgoNetworkNetwork = (props: egoNetworkNetworkNodeProps) => {
    const { aggregateEgoNetworkNodeIDs } = props;

    const [egoNetworkNetwork, getEgoNetworkNetwork] = useAtom(
        egoNetworkNetworksAtom
    );
    const [bundleGroupSize]=useAtom(bundleGroupSizeAtom);

    const nodeClone = structuredClone(egoNetworkNetwork.nodes);
    const edgeClone = structuredClone(egoNetworkNetwork.edges);

    const { outNodes, outEdges } = aggregateEgoNetworkNodes(
        nodeClone,
        edgeClone,
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
        .force('collision', d3.forceCollide().radius(d=>d.size));

    forceLayout.stop();
    for (let i = 0; i < 100; i++) {
        forceLayout.tick();
    }

    return (
        <g>
            {outEdges.map((edge) => {
                const sourceNode = outNodes.find(
                    (node) => node.id === edge.source.id
                );

                const targetNode = outNodes.find(
                    (node) => node.id === edge.target.id
                );
                return (
                    <EgoNetworkNetworkEdge
                        key={edge.source.id + '+' + edge.target.id}
                        source={edge.source}
                        target={edge.target}
                        weight={edge.weight}
                        x1={sourceNode ? sourceNode.x : 0}
                        y1={sourceNode ? sourceNode.y : 0}
                        x2={targetNode ? targetNode.x : 0}
                        y2={targetNode ? targetNode.y : 0}
                    />
                );
            })}

            {outNodes.map((node) => {
                if(node.color){
                    return <EgoGraphBundle key={node.id} x={node.x-bundleGroupSize.width/2} y={node.y-bundleGroupSize.height/2} nodeId={node.id}/>
                }
                else return (
                    <EgoNetworkNetworkNode
                        key={node.id}
                        id={node.id}
                        size={node.size / 20}
                        x={node.x}
                        y={node.y}
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
    aggregateNodeIDs: string[]
): { outNodes: egoNetworkNetworkNode[]; outEdges: egoNetworkNetworkEdge[] } {
    const outNodes: egoNetworkNetworkNode[] = [];
    const outEdges: egoNetworkNetworkEdge[] = [];

    let sizeAccumulator = 0;
    let xAccumulator = 0;
    let yAccumulator = 0;
    for (const node of egoNetworkNodesNodes) {
        if (!aggregateNodeIDs.includes(node.id)) {
            outNodes.push(node);
        } else {
            sizeAccumulator += node.size;
            xAccumulator += node.x;
            yAccumulator += node.y;
        }
    }
    xAccumulator = xAccumulator / aggregateNodeIDs.length;
    yAccumulator = yAccumulator / aggregateNodeIDs.length;

    const aggregateID = aggregateNodeIDs.join(';');
    outNodes.push({
        id: aggregateID,
        name: aggregateID,
        size: sizeAccumulator,
        x: 0,
        y: 0,
        color: 'green'
    });

    // add all edges that do not have a source or target in aggregateNodeIDs to outEdges
    // instead of the edges that have a source or target in aggregateNodeIDs add a new edge to outEdges that targets the new node and has the sum of the weights of the edges as weight
    for (const edge of egoNetworkNetworkEdges) {
        if (
            !aggregateNodeIDs.includes(edge.source) &&
            !aggregateNodeIDs.includes(edge.target)
        ) {
            outEdges.push(edge);
        } else {
            const weight = aggregateNodeIDs.reduce((acc, cur) => {
                const currentEdge = egoNetworkNetworkEdges.find(
                    (edge) => edge.source === cur || edge.target === cur
                );
                const currentEdgeWeight = currentEdge ? currentEdge.weight : 0;
                return acc + currentEdgeWeight;
            }, 0);
            //check which edges to add
            // no edges from aggregateNodeIDs to aggregateNodeIDs should be added
            // edges from aggregateNodeIDs to other nodes should be added
            // edges from other nodes to aggregateNodeIDs should be added

            const sourceInAggregate = aggregateNodeIDs.includes(edge.source);
            const targetInAggregate = aggregateNodeIDs.includes(edge.target);

            if (!sourceInAggregate || !targetInAggregate) {
                const newEdge: egoNetworkNetworkEdge = {
                    source: sourceInAggregate ? aggregateID : edge.source,
                    target: targetInAggregate ? aggregateID : edge.target,
                    weight: weight
                };
                if (
                    !outEdges.find(
                        (edge) =>
                            edge.source === newEdge.source &&
                            edge.target === newEdge.target
                    )
                ) {
                    outEdges.push(newEdge);
                }
            }
        }
    }

    return { outNodes: outNodes, outEdges: outEdges };
}
