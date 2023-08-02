import { useMemo } from 'react';
import { useAtom } from 'jotai';

import {
    colorScaleAtom,
    egoGraphBundleAtom, innerRadiusAtom,
    nodeRadiusAtom,
    nodesAtomsAtom, outerRadiusAtom
} from './egoGraphBundleStore';
import { EgographNode } from './egographNode';

const EgographBundle = (props:{x:number,y:number}) => {
    const {x,y}=props
    const [layout] = useAtom(egoGraphBundleAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [nodeRadius] = useAtom(nodeRadiusAtom);
    const [innerRadius]=useAtom(innerRadiusAtom);
    const [outerRadius]=useAtom(outerRadiusAtom);

    return useMemo(() => {
        let lines = [];
        const layoutCircles = layout.centers.map((center,i) => {
            return (
                <g key={i}>
                    <circle cx={center.x} cy={center.y} r={innerRadius} stroke={"lightgray"} fill={"none"}/>
                    <circle cx={center.x} cy={center.y} r={outerRadius} stroke={"lightgray"} fill={"none"}/>
                </g>
            );
        });
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
                    stroke={isVisible ? 'gray' : 'none'}
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
                        opacity={0.3}
                        strokeWidth={nodeRadius * 2}
                    />
                );
            })
        );
        return (
            <g transform={`translate(${x},${y})`}>
                {layoutCircles}
                {lines}
                {circles}
            </g>
        );
    }, [colorScale, innerRadius, layout.centers, layout.edges, layout.identityEdges, layout.nodes, nodeAtoms, nodeRadius, outerRadius, x, y]);
};
export default EgographBundle;
