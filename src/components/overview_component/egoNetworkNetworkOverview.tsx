import { useAtom } from 'jotai';
import {
    aggregateNetworkAtom,
    highlightNodeAtom,
    scaleNodeSizeAtom
} from './egoNetworkNetworkOverviewStore';
import EgoNetworkNetworkOverviewNode from './egoNetworkNetworkOverviewNode';
import EgoNetworkNetworkOverviewEdge from './egoNetworkNetworkOverviewEdge';
import { accountedProteinsNeigborhoodAtom } from '../../apiCalls.ts';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import * as d3 from 'd3';
import { tarNodeAtom } from '../detailPanel/radarchart/radarStore.ts';
import { useMemo } from 'react';

const EgoNetworkNetworkOverview = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [selectedEgoCenters] = useAtom(selectedProteinsAtom);
    const [accountedProteinsNeigborhood] = useAtom(
        accountedProteinsNeigborhoodAtom
    );
    const [scaleSize] = useAtom(scaleNodeSizeAtom);
    const [tarNode] = useAtom(tarNodeAtom);
    const [highlightNode] = useAtom(highlightNodeAtom);
    // split edges into two groups based on whether their source/target is in highlightedNode

    const setProteinSelected = useMemo(
        () => new Set(selectedEgoCenters),
        [selectedEgoCenters]
    );
    const highlightedEdges = useMemo(
        () =>
            edges.filter(
                (edge) =>
                    highlightNode == edge.source.id ||
                    highlightNode == edge.target.id ||
                    (setProteinSelected.has(edge.source.id) &&
                        setProteinSelected.has(edge.target.id))
            ),
        [edges, highlightNode, setProteinSelected]
    );

    return (
        <g>
            {edges.map((edge) => {
                return (
                    <EgoNetworkNetworkOverviewEdge
                        key={edge.source.id + '+' + edge.target.id}
                        color="#cccccc"
                        opacity={edge.weight}
                        weight={edge.weight}
                        x1={edge.source.x}
                        y1={edge.source.y}
                        x2={edge.target.x}
                        y2={edge.target.y}
                    />
                );
            })}
            {highlightedEdges.map((edge) => {
                return (
                    <EgoNetworkNetworkOverviewEdge
                        key={edge.source.id + '+' + edge.target.id}
                        color="#000000"
                        opacity={1.0}
                        weight={edge.weight}
                        x1={edge.source.x}
                        y1={edge.source.y}
                        x2={edge.target.x}
                        y2={edge.target.y}
                    />
                );
            })}

            {nodes.map((node) => {
                const sizeNode = Math.sqrt(scaleSize(node.size) / Math.PI);
                const nodeNeighbors = node.neighbors ?? [];

                // Intersection between nodeNeighbors and accountedProteinsNeigborhood
                const coverageProteins =
                    nodeNeighbors.filter((value) =>
                        accountedProteinsNeigborhood.has(value)
                    ).length / nodeNeighbors.length ?? 0;
                const isProteinSelected = setProteinSelected.has(node.id);
                const colorGradientFill = d3
                    .scaleLinear()
                    .domain([0, 1])
                    // FIXME Range not defined correctly
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore ts2304
                    .range(['white', '#464646']);
                return (
                    <EgoNetworkNetworkOverviewNode
                        key={node.id}
                        id={node.id}
                        size={sizeNode}
                        x={node.x}
                        y={node.y}
                        color={
                            tarNode === node.id
                                ? '#ffff99'
                                : isProteinSelected
                                ? '#ff7f00'
                                : String(colorGradientFill(coverageProteins))
                        }
                    />
                );
            })}
        </g>
    );
};

export default EgoNetworkNetworkOverview;
