import { useMemo } from 'react';
import { useAtom } from 'jotai';

import {
    colorScaleAtom,
    egoGraphBundleAtom,
    nodeRadiusAtom,
    nodesAtomsAtom
} from './egoGraphBundleStore';
import { EgographNode } from './egographNode';

const EgographBundle = () => {
    const [layout] = useAtom(egoGraphBundleAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [nodeRadius] = useAtom(nodeRadiusAtom);

    return useMemo(() => {
        let lines = [];
        const circles = Object.values(layout.nodes).map((node, i) => {
            return (
                <EgographNode
                    key={node.id}
                    centerPoint={{ x: node.cx, y: node.cy }}
                    nodeRadius={nodeRadius}
                    nodeAtom={nodeAtoms[i]}
                    fill={String(colorScale(node.numEdges))}
                />
            );
        });

        lines = layout.edges.map((edge) => {
            const isVisible =
                layout.nodes[edge.sourceIndex].hovered ||
                layout.nodes[edge.targetIndex].hovered;
            return (
                <line
                    key={String(edge.source) + String(edge.target)}
                    x1={edge.x1}
                    x2={edge.x2}
                    y1={edge.y1}
                    y2={edge.y2}
                    stroke={isVisible ? 'black' : 'none'}
                />
            );
        });
        lines.push(
            ...layout.identityEdges.map((edge) => {
                return (
                    <line
                        key={edge.id}
                        x1={edge.x1}
                        x2={edge.x2}
                        y1={edge.y1}
                        y2={edge.y2}
                        stroke={'gray'}
                        opacity={0.5}
                        strokeWidth={nodeRadius * 2}
                    />
                );
            })
        );
        return (
            <>
                {lines}
                {circles}
            </>
        );
    }, [
        colorScale,
        layout.edges,
        layout.identityEdges,
        layout.nodes,
        nodeAtoms,
        nodeRadius
    ]);
};
export default EgographBundle;
