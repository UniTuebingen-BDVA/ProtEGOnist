import { useAtom } from 'jotai';
import { egoNetworkNetworksAtom } from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import * as d3 from 'd3';

const EgoNetworkNetwork = () => {
    const [egoNetworkNetwork, getEgoNetworkNetwork] = useAtom(
        egoNetworkNetworksAtom
    );
    // temporary pair of 3 node positions

    // generate a structure clone from the nodes and edges

    const nodeClone = structuredClone(egoNetworkNetwork.nodes);
    const edgeClone = structuredClone(egoNetworkNetwork.edges);

    const forceLayout = d3
        .forceSimulation(nodeClone)
        .force('charge', d3.forceManyBody().strength(-100))
        .force(
            'link',
            d3
                .forceLink(edgeClone)
                .id((d) => d.id)
                .distance(50)
        )
        .force('center', d3.forceCenter(0, 0))
        .force('collision', d3.forceCollide().radius(50));

    forceLayout.stop();
    for (let i = 0; i < 100; i++) {
        forceLayout.tick();
    }

    return (
        <g>
            {edgeClone.map((edge) => {
                const sourceNode = nodeClone.find(
                    (node) => node.id === edge.source.id
                );

                const targetNode = nodeClone.find(
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

            {nodeClone.map((node) => {
                return (
                    <EgoNetworkNetworkNode
                        key={node.id}
                        id={node.id}
                        size={node.size / 5}
                        x={node.x}
                        y={node.y}
                    />
                );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;
