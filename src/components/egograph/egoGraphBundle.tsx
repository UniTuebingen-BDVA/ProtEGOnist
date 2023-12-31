// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ReactElement, useMemo } from 'react';
import { useAtom } from 'jotai';

import { egoGraphBundlesLayoutAtom } from './egoGraphBundleStore';
import { EgographNode } from './egographNode';
import EgoGraphBand from './egoGraphBand.tsx';
import { atom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import * as d3 from 'd3';
import {
    decollapseNodeAtom,
    highlightedEdgesAtom
} from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { edgesClassificationAtom, nameNodesByAtom } from '../../apiCalls.ts';
import { useSetAtom } from 'jotai/index';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore.ts';
import { tableAtom } from '../selectionTable/tableStore';

const EgographBundle = (props: { x: number; y: number; nodeId: string }) => {
    const { x, y, nodeId } = props;

    // "local store"
    const egoGraphBundleAtom = useMemo(() => {
        return focusAtom(egoGraphBundlesLayoutAtom, (optic) =>
            optic.prop(nodeId)
        );
    }, [nodeId]); //egoGraphBundlesLayoutAtom NEEDS to be in the dependency array, otherwise the atom will not update when the store updates
    const isLoadedAtom = useMemo(
        () => atom((get) => get(egoGraphBundleAtom) !== undefined),
        [egoGraphBundleAtom]
    );
    const nodeAtom = useMemo(
        () => focusAtom(egoGraphBundleAtom, (optic) => optic.prop('nodes')),
        [egoGraphBundleAtom]
    );
    const nodesAtomsAtom = useMemo(() => splitAtom(nodeAtom), [nodeAtom]);
    const numEdgesMinMax = useMemo(
        () =>
            atom((get) => {
                const numEdges = get(egoGraphBundleAtom)
                    ?.nodes.filter((d) => !d.isCenter)
                    .map((d) => d.numEdges);
                if (numEdges && numEdges.length > 0) {
                    return [Math.min(...numEdges), Math.max(...numEdges)];
                } else return [0, 0];
            }),
        [egoGraphBundleAtom]
    );
    const colorScaleAtom = useMemo(
        () =>
            atom((get) => {
                return d3
                    .scaleLinear<string, number>()
                    .domain(get(numEdgesMinMax))
                    .range(['#f6e9ea', '#860028']);
            }),
        [numEdgesMinMax]
    );

    const highlightedNodeIndicesAtom = useMemo(() => atom<number[]>([]), []);

    const [isLoaded] = useAtom(isLoadedAtom);
    const [layout] = useAtom(egoGraphBundleAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [highlightedNodeIndices] = useAtom(highlightedNodeIndicesAtom);
    const [highlightedEdges] = useAtom(highlightedEdgesAtom);
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const setContextMenu = useSetAtom(contextMenuAtom);
    const setDecollapseID = useSetAtom(decollapseNodeAtom);

    const getNodeName = (id) => {
        // find the rows in the table that match the uniprot ID
        // const filteredRows = tableData.rows.filter((row) => {
        //     return row['nodeID'] === id;
        // });
        const nodeData = tableData.rows[id];

        const nodeNames = (nodeData?.[nameNodesBy] ?? nodeData.nodeID).split(
            ';'
        );
        // generate set of unique protein names
        const uniqueNodeNames = [...new Set(nodeNames)];
        // join the protein names with a comma
        return uniqueNodeNames.join(', ');
    };
    // generate a d3 categorcal color scale with 20 colors
    const [edgesClassification] = useAtom(edgesClassificationAtom);

    const backgroundCircles = useMemo(
        () =>
            layout.centers.map((center) => (
                <circle
                    key={center.id}
                    cx={center.x}
                    cy={center.y}
                    r={center.outerSize}
                    strokeWidth={7}
                    fill={'white'}
                />
            )),
        [layout.centers]
    );
    const layoutCircles = useMemo(
        () =>
            layout.centers.map((center) => {
                const outerRadius = center.outerSize * (5 / 6);
                return (
                    <g
                        key={center.id}
                        onClick={() => setDecollapseID(center.id)}
                        onContextMenu={(event) => {
                            setContextMenu(event, center.id);
                        }}
                    >
                        <circle
                            cx={center.x}
                            cy={center.y}
                            strokeWidth={center.outerSize * (7 / 18)}
                            r={outerRadius}
                            stroke={'white'}
                            fill={'none'}
                        />
                        <circle
                            cx={center.x}
                            cy={center.y}
                            r={center.outerSize}
                            stroke={
                                highlightedEdges.ids.includes(center.id)
                                    ? 'black'
                                    : 'transparent'
                            }
                            strokeWidth={7}
                            fill={'none'}
                        />
                        <circle
                            cx={center.x}
                            cy={center.y}
                            r={center.outerSize * (18 / 35)}
                            fill={'white'}
                        />
                        <text
                            textAnchor="middle"
                            fontSize={
                                outerRadius / 3 < 30 ? 30 : outerRadius / 3
                            }
                            dy={`-${
                                outerRadius / 3 < 30 ? 30 : outerRadius / 3
                            }`}
                        >
                            <textPath
                                startOffset={'50%'}
                                path={`
                        M ${center.x} ${center.y}
                        m 0, ${outerRadius}
                        a ${outerRadius},${outerRadius} 0 1,1,0 -${
                            outerRadius * 2
                        }
                        a ${outerRadius},${outerRadius} 0 1,1,0  ${
                            outerRadius * 2
                        }
                        `}
                            >
                                {getNodeName(center.id)}
                            </textPath>
                        </text>
                    </g>
                );
            }),
        [highlightedEdges, layout.centers, setDecollapseID]
    );
    const circles = useMemo(() => {
        const returnCircles: ReactElement[] = [];
        Object.values(layout.nodes).forEach((node, i) => {
            if (!node.pseudo) {
                const egoID = node.id.split('_')[0];

                returnCircles.push(
                    <EgographNode
                        key={node.id}
                        centerPoint={{ x: node.cx, y: node.cy }}
                        nodeRadius={node.centerDist === 0 ? 5 : 2.5}
                        egoRadius={layout.radii[egoID]}
                        centerNode={layout.centers.find(
                            (center) => center.id === egoID
                        )}
                        nodeAtom={nodeAtoms[i]}
                        highlightedNodeIndicesAtom={highlightedNodeIndicesAtom}
                        fill={
                            node.firstLast
                                ? 'red'
                                : String(colorScale(node.numEdges))
                        }
                    />
                );
            }
        });
        return returnCircles;
    }, [
        colorScale,
        highlightedNodeIndicesAtom,
        layout.nodes,
        layout.centers,
        layout.radii,
        nodeAtoms
    ]);
    const bands = useMemo(() => {
        const returnBands: ReactElement[] = [];
        if (layout.bandData) {
            Object.entries(layout.bandData).forEach((band, i) => {
                returnBands.push(
                    <EgoGraphBand
                        key={i}
                        bandData={band}
                        color={
                            band[0].split(',').length === 3
                                ? '#778ea9'
                                : '#bed2e8'
                        }
                        twoCase={Object.entries(layout.bandData).length === 1}
                    />
                );
            });
        }
        return returnBands;
    }, [layout.bandData]);

    const lines = useMemo(
        () =>
            layout.edges
                .filter(
                    (edge) =>
                        highlightedNodeIndices.includes(edge.sourceIndex) ||
                        highlightedNodeIndices.includes(edge.targetIndex)
                )
                .map((edge) => {
                    let colorEdge: string;
                    // show edge if any node with the same original ID as source/target is hovered
                    if (edgesClassification === null) {
                        colorEdge = '#67001f';
                    } else {
                        const temp_edge_source = edge.source.split('_')[1];
                        const temp_edge_target = edge.target.split('_')[1];
                        const sortedEdges = d3.sort([
                            temp_edge_source,
                            temp_edge_target
                        ]);
                        const keyEdges = `${sortedEdges[0]}_${sortedEdges[1]}`;
                        // console.log(edgesClassification[keyEdges])
                        const edgeValue: number | null =
                            edgesClassification?.[keyEdges] ?? null;
                        if (edgeValue !== null) {
                            colorEdge = edgeValue === '-1' ? 'red' : 'blue';
                            // TODO make a color scale
                        } else {
                            colorEdge = '#67001f';
                        }
                    }
                    return (
                        <line
                            key={String(edge.source) + String(edge.target)}
                            style={{ pointerEvents: 'none' }}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke={colorEdge}
                        />
                    );
                }),
        [highlightedNodeIndices, layout.edges, edgesClassification]
    );
    const [foregroundBands, backgroundBands] = useMemo(() => {
        const foregroundBands: ReactElement[] = [];
        const backgroundBands: ReactElement[] = [];
        layout.identityEdges.forEach((edge) => {
            const isHighlighted =
                highlightedNodeIndices.includes(edge.sourceIndex) ||
                highlightedNodeIndices.includes(edge.targetIndex);
            if (isHighlighted) {
                foregroundBands.push(
                    <line
                        key={edge.id}
                        style={{ pointerEvents: 'none' }}
                        x1={edge.x1}
                        x2={edge.x2}
                        y1={edge.y1}
                        y2={edge.y2}
                        stroke={'black'}
                    />
                );
            } /* else {
                if (!edge.alwaysDraw) {
                    backgroundBands.push(
                        <line
                            key={edge.id}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke={'#d0d0d0'}
                            opacity={1}
                        />
                    );
                }
            }*/
        });
        return [foregroundBands, backgroundBands];
    }, [highlightedNodeIndices, layout.identityEdges]);
    return isLoaded ? (
        <g transform={`translate(${x},${y})`}>
            {backgroundCircles}
            {bands}
            {layoutCircles}
            {backgroundBands}
            {circles}
            {foregroundBands}
            {lines}
        </g>
    ) : null;
};
export default EgographBundle;
