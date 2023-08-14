import { useAtom } from 'jotai';
import { aggregateNetworkAtom, scaleNodeSizeAtom } from './egoNetworkNetworkOverviewStore';
import EgoNetworkNetworkOverviewNode from './egoNetworkNetworkOverviewNode';
import EgoNetworkNetworkOverviewEdge from './egoNetworkNetworkOverviewEdge';
import { accountedProteinsNeigborhoodAtom} from "../../apiCalls.ts";
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import * as d3 from 'd3';
import { tarNodeAtom } from '../radarchart/radarStore.ts';
const EgoNetworkNetworkOverview = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [selectedEgoCenters] = useAtom(selectedProteinsAtom)
    const [accountedProteinsNeigborhood] = useAtom(accountedProteinsNeigborhoodAtom)
    const [scaleSize] = useAtom(scaleNodeSizeAtom)
        const [tarNode] = useAtom(tarNodeAtom);
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
                let sizeNode = Math.sqrt(scaleSize(node.size)/Math.PI)
                let nodeNeighbors = node.neighbors ?? []
                let setProteinSelected = new Set(selectedEgoCenters)
                
                // Intersection between nodeNeighbors and accountedProteinsNeigborhood
                let coverageProteins = nodeNeighbors.filter(value => accountedProteinsNeigborhood.has(value)).length / nodeNeighbors.length ?? 0;
                let isProteinSelected = setProteinSelected.has(node.id)
                let colorGradientFill = d3.scaleLinear().domain([0, 1]).range(["white", '#1f78b4']);
                    return (
                        <EgoNetworkNetworkOverviewNode
                            key={node.id}
                            id={node.id}
                            size={sizeNode}
                            x={node.x}
                            y={node.y}
                            color={tarNode===node.id?'#ffff99':isProteinSelected?'#ff7f00':colorGradientFill(coverageProteins)}
                        />
                    );
            })}
             
        </g>
    );
};

export default EgoNetworkNetworkOverview;
