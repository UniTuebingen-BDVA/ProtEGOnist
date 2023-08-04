import { useMemo } from 'react';
import { useAtom } from 'jotai';

import {
    colorScaleAtom,
    egoGraphBundleAtom,
    highlightedNodIndicesAtom,
    innerRadiusAtom,
    nodeRadiusAtom,
    nodesAtomsAtom,
    outerRadiusAtom
} from './egoGraphBundleStore';
import { EgographNode } from './egographNode';

const EgographBundle = (props: { x: number; y: number }) => {
    const { x, y } = props;
    const [layout] = useAtom(egoGraphBundleAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [nodeRadius] = useAtom(nodeRadiusAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [highlightedNodeIndices] = useAtom(highlightedNodIndicesAtom);

    return useMemo(() => {
        let lines = [];
        const foregroundBands: React.ReactElement[] = [];
        const backgroundBands: React.ReactElement[] = [];
        const layoutCircles = layout.centers.map((center, i) => {
            return (
                <g key={i}>
                    <circle
                        cx={center.x}
                        cy={center.y}
                        r={innerRadius}
                        stroke={'lightgray'}
                        fill={'none'}
                    />
                    <circle
                        cx={center.x}
                        cy={center.y}
                        r={outerRadius}
                        stroke={'lightgray'}
                        fill={'none'}
                    />
                </g>
            );
        });
        const circles: React.ReactElement[] = [];
        Object.values(layout.nodes).forEach((node, i) => {
            if (!node.pseudo) {
                circles.push(
                    <EgographNode
                        key={node.id}
                        centerPoint={{ x: node.cx, y: node.cy }}
                        nodeRadius={nodeRadius}
                        nodeAtom={nodeAtoms[i]}
                        fill={String(colorScale(node.numEdges))}
                    />
                );
            }
        });

        lines = layout.edges.map((edge) => {
            // show edge if any node with the same original ID as source/target is hovered
            const isVisible =
                highlightedNodeIndices.includes(edge.sourceIndex) ||
                highlightedNodeIndices.includes(edge.targetIndex);
            return (
                <line
                    key={String(edge.source) + String(edge.target)}
                    x1={edge.x1}
                    x2={edge.x2}
                    y1={edge.y1}
                    y2={edge.y2}
                    stroke={isVisible ? 'gray' : 'none'}
                />
            );
        });
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
                backgroundBands.push(
                    <line
                        key={edge.id}
                        x1={edge.x1}
                        x2={edge.x2}
                        y1={edge.y1}
                        y2={edge.y2}
                        stroke={'gray'}
                        opacity={0.3}
                        strokeWidth={nodeRadius * 2}
                    />
                );
            }
        });
        return (
            <g transform={`translate(${x},${y})`}>
                {layoutCircles}
                {lines}
                {backgroundBands}
                {foregroundBands}
                {circles}
            </g>
        );
    }, [
        colorScale,
        highlightedNodeIndices,
        innerRadius,
        layout.centers,
        layout.edges,
        layout.identityEdges,
        layout.nodes,
        nodeAtoms,
        nodeRadius,
        outerRadius,
        x,
        y
    ]);
};
export default EgographBundle;
