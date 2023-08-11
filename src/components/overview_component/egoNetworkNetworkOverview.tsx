import { useAtom } from 'jotai';
import { aggregateNetworkAtom, scaleNodeSizeAtom, egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore';
import EgoNetworkNetworkNode from '../egoNetworkNetwork/egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from '../egoNetworkNetwork/egoNetworkNetworkEdge.tsx';
const EgoNetworkNetwork = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);


    const [scaleSize] = useAtom(scaleNodeSizeAtom)
    return (
        <g>
            {edges.map( edge => {
                return (
                    <EgoNetworkNetworkEdge
                        key={edge.source.id + '+' + edge.target.id}
                        source={edge.source}
                        target={edge.target}
                        weight={edge.weight}
                        x1={edge.source.x}
                        y1={edge.source.y}
                        x2={edge.target.x}
                        y2={edge.target.y}
                    />
                );
            })}

            {nodes.map( (node) => {
                let sizeNode = scaleSize.scale(node.size)
                let fixX = Math.max(0+sizeNode, Math.min(node.x, svgSize.width-sizeNode));
                let fixY = Math.max(0+sizeNode, Math.min(node.y, svgSize.height-sizeNode));
                    return (
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={sizeNode}
                            x={node.x}
                            y={node.y}
                            color={'red'}
                            decollapsePossible={false}
                        />
                    );
            })}
             
        </g>
    );
};

export default EgoNetworkNetwork;
