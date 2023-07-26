import { useAtom } from 'jotai';
import { egoNetworkNetworksAtom } from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';

const EgoNetworkNetwork = () => {
    const [egoNetworkNetwork, getEgoNetworkNetwork] = useAtom(
        egoNetworkNetworksAtom
    );
    // temporary pair of 3 node positions
    const nodePositions = {
        P07093: { x: -50, y: 50 },
        P30533: { x: 50, y: 50 },
        Q9Y625: { x: 0, y: -50 }
    };
    return (
        <g>
            {egoNetworkNetwork.edges.map((edge) => {
                const x1 = nodePositions[edge.source].x;
                const y1 = nodePositions[edge.source].y;
                const x2 = nodePositions[edge.target].x;
                const y2 = nodePositions[edge.target].y;
                return (
                    <EgoNetworkNetworkEdge
                        source={edge.source}
                        target={edge.target}
                        weight={edge.weight}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                    />
                );
            })}

            {egoNetworkNetwork.nodes.map((node) => {
                const x = nodePositions[node.id].x;
                const y = nodePositions[node.id].y;

                return (
                    <EgoNetworkNetworkNode
                        id={node.id}
                        size={node.size / 5}
                        x={x}
                        y={y}
                    />
                );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;
