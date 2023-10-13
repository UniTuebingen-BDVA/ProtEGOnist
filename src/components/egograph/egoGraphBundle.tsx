// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { ReactElement, useMemo } from 'react';
import { useAtom } from 'jotai';

import {
    innerRadiusAtom,
    outerRadiusAtom,
    maxRadiusAtom,
    egoGraphBundlesLayoutAtom
} from './egoGraphBundleStore';
import { EgographNode } from './egographNode';
import EgoGraphBand from './egoGraphBand.tsx';
import { atom } from 'jotai';
import { egoGraphLayout } from './egolayout.ts';
import { focusAtom } from 'jotai-optics';
import { splitAtom } from 'jotai/utils';
import * as d3 from 'd3';
import { decollapseIDsAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';

const EgographBundle = (props: { x: number; y: number; nodeId: string }) => {
    const { x, y, nodeId } = props;

    // "local store"
    const egoGraphBundleDataAtom = useMemo(() => {
        return focusAtom(egoGraphBundlesLayoutAtom, (optic) =>
            optic.prop(nodeId)
        );
    }, [nodeId]);
    const isLoadedAtom = useMemo(
        () => atom((get) => get(egoGraphBundleDataAtom) !== undefined),
        [egoGraphBundleDataAtom]
    );
    const egoGraphBundleDefaultAtom = useMemo(
        () =>
            atom((get) => {
                const data = get(egoGraphBundleDataAtom);
                if (!data) {
                    return {
                        edges: [],
                        nodes: [],
                        identityEdges: [],
                        maxRadius: 0,
                        centers: []
                    };
                } else {
                    return get(egoGraphBundleDataAtom);
                }
            }),
        [egoGraphBundleDataAtom]
    );
    const egoGraphBundleOverwrittenAtom = useMemo(() => atom(null), []);
    // writable version of egoGraphBundle
    const egoGraphBundleAtom = useMemo(
        () =>
            atom<egoGraphLayout>(
                (get) => {
                    return (
                        get(egoGraphBundleOverwrittenAtom) ||
                        get(egoGraphBundleDefaultAtom)
                    );
                },

                (_get, set, action) =>
                    set(egoGraphBundleOverwrittenAtom, action)
            ),
        [egoGraphBundleDefaultAtom, egoGraphBundleOverwrittenAtom]
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
                    .range(['#e9cfd7', '#860028'])
                    .domain(get(numEdgesMinMax));
            }),
        [numEdgesMinMax]
    );
    const bundleColorScaleAtom = useMemo(
        () =>
            atom((get) => {
                return d3.scaleOrdinal(d3.schemeTableau10);
            }),
        [egoGraphBundleAtom]
    );

    const nodeRadiusAtom = useMemo(
        () =>
            atom((get) => {
                return get(maxRadiusAtom) < get(egoGraphBundleAtom).maxradius
                    ? get(maxRadiusAtom)
                    : get(egoGraphBundleAtom).maxradius;
            }),
        [egoGraphBundleAtom]
    );
    const highlightedNodeIndicesAtom = useMemo(() => atom<number[]>([]), []);

    const [isLoaded] = useAtom(isLoadedAtom);
    const [layout] = useAtom(egoGraphBundleAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [nodeRadius] = useAtom(nodeRadiusAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [highlightedNodeIndices] = useAtom(highlightedNodeIndicesAtom);
    const [_, setDecollapseID] = useAtom(decollapseIDsAtom);
    // generate a d3 categorcal color scale with 20 colors
    const [bandColorScale] = useAtom(bundleColorScaleAtom);

    const layoutCircles = useMemo(
        () =>
            layout.centers.map((center) => {
                return (
                    <g
                        key={center.id}
                        onClick={() => setDecollapseID(center.id)}
                    >
                        <circle
                            cx={center.x}
                            cy={center.y}
                            r={outerRadius}
                            stroke={'lightgray'}
                            fill={'white'}
                        />
                        <circle
                            cx={center.x}
                            cy={center.y}
                            r={innerRadius}
                            stroke={'lightgray'}
                            fill={'none'}
                        />
                    </g>
                );
            }),
        [innerRadius, layout.centers, outerRadius, setDecollapseID]
    );
    const circles = useMemo(() => {
        const returnCircles: ReactElement[] = [];
        Object.values(layout.nodes).forEach((node, i) => {
            if (!node.pseudo)
                returnCircles.push(
                    <EgographNode
                        key={node.id}
                        centerPoint={{ x: node.cx, y: node.cy }}
                        nodeRadius={node.centerDist === 0 ? 5 : nodeRadius}
                        nodeAtom={nodeAtoms[i]}
                        highlightedNodeIndicesAtom={highlightedNodeIndicesAtom}
                        fill={
                            node.firstLast
                                ? 'red'
                                : String(colorScale(node.numEdges))
                        }
                    />
                );
        });
        return returnCircles;
    }, [
        colorScale,
        highlightedNodeIndicesAtom,
        layout.nodes,
        nodeAtoms,
        nodeRadius
    ]);

    const bands = useMemo(() => {
        const returnBands: ReactElement[] = [];
        if (layout.bandData) {
            Object.entries(layout.bandData).forEach((band, i) => {
                returnBands.push(
                    <EgoGraphBand
                        key={i}
                        bandData={band}
                        radius={outerRadius}
                        color={bandColorScale(i)}
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
                    // show edge if any node with the same original ID as source/target is hovered
                    return (
                        <line
                            key={String(edge.source) + String(edge.target)}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke={'#67001f'}
                        />
                    );
                }),
        [highlightedNodeIndices, layout.edges]
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
                        x1={edge.x1}
                        x2={edge.x2}
                        y1={edge.y1}
                        y2={edge.y2}
                        stroke={'black'}
                        strokeWidth={nodeRadius * 2}
                    />
                );
            } else {
                if (!edge.alwaysDraw) {
                    backgroundBands.push(
                        <line
                            key={edge.id}
                            x1={edge.x1}
                            x2={edge.x2}
                            y1={edge.y1}
                            y2={edge.y2}
                            stroke={'gray'}
                            opacity={0.2}
                            strokeWidth={nodeRadius * 2}
                        />
                    );
                }
            }
        });
        return [foregroundBands, backgroundBands];
    }, [highlightedNodeIndices, layout.identityEdges, nodeRadius]);
    return isLoaded ? (
        <g transform={`translate(${x},${y})`}>
            {layoutCircles}
            {lines}
            {backgroundBands}
            {foregroundBands}
            {circles}
            {bands}
        </g>
    ) : null;
};
export default EgographBundle;
