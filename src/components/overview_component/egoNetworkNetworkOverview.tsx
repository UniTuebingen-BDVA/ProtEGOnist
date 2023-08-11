import { useAtom } from 'jotai';
import { aggregateNetworkAtom, scaleNodeSizeAtom, egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore';
import EgoNetworkNetworkOverviewNode from './egoNetworkNetworkOverviewNode';
import EgoNetworkNetworkOverviewEdge from './egoNetworkNetworkOverviewEdge';
import { accountedProteinsNeigborhoodAtom} from "../../apiCalls.ts";
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import { get } from 'optics-ts';

const EgoNetworkNetworkOverview = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [selectedEgoCenters] = useAtom(selectedProteinsAtom)
    const [accountedProteinsNeigborhood] = useAtom(accountedProteinsNeigborhoodAtom)
    console.log(selectedEgoCenters)
    console.log(accountedProteinsNeigborhood)


    const [scaleSize] = useAtom(scaleNodeSizeAtom)
    return (
        <g>
            {edges.map( edge => {
                return (
                    <EgoNetworkNetworkOverviewEdge
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
                let nodeNeighbors = node.neighbors
                // Intersection between nodeNeighbors and accountedProteinsNeigborhood
                let coverageProteins = nodeNeighbors.filter(value => accountedProteinsNeigborhood.has(value)).length / nodeNeighbors.length;
               
                    return (
                        <EgoNetworkNetworkOverviewNode
                            key={node.id}
                            id={node.id}
                            size={sizeNode}
                            x={node.x}
                            y={node.y}
                            color={'red'}
                            opacity={coverageProteins}
                        />
                    );
            })}
             
        </g>
    );
};

export default EgoNetworkNetworkOverview;
