import React, { useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import { useAtom } from 'jotai';

import {
    centerPointAtom,
    collapsedAtom,
    colorScaleAtom,
    graphAtom,
    nodeRadiusAtom,
    nodesAtomsAtom
} from './egoStore.ts';
import { EgographNode } from './egographNode.tsx';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './networkStore.ts';

const Egograph = () => {
    const [egoGraphSize] = useAtom(graphSizeAtom);
    const [layout] = useAtom(graphAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [colorScale] = useAtom(colorScaleAtom);
    const [collapsed, setCollapsed] = useAtom(collapsedAtom);
    const [nodeRadius] = useAtom(nodeRadiusAtom);
    const [centerPoint] = useAtom(centerPointAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);

    const selectElements = useCallback((element: ParentNode) => {
        const childNodes = element.children;
        if (childNodes && childNodes.length > 1) {
            const circles = [...childNodes].filter(
                (d) => d.nodeName === 'circle' && d.id != 'background'
            );
            const lines = [...childNodes].filter((d) => d.nodeName === 'line');
            return { circles, lines };
        }
    }, []);
    const applyLayout = useCallback(
        (element: SVGElement) => {
            const selection = selectElements(element);
            if (selection) {
                d3.selectAll(selection.circles)
                    .data(Object.values(layout.nodes))
                    .transition()
                    .duration(200)
                    .attr('cx', (d) => d.cx)
                    .attr('cy', (d) => d.cy);
                d3.selectAll(selection.lines)
                    .data(layout.edges)
                    .transition()
                    .duration(200)
                    .attr('x1', (d) => d.x1)
                    .attr('x2', (d) => d.x2)
                    .attr('y1', (d) => d.y1)
                    .attr('y2', (d) => d.y2);
            }
        },
        [layout, selectElements]
    );
    const removeLayout = useCallback(
        (event: React.MouseEvent) => {
            if (
                event.target &&
                event.target instanceof SVGElement &&
                event.target.parentNode
            ) {
                const selection = selectElements(event.target.parentNode);
                if (selection) {
                    d3.selectAll(selection.circles)
                        .data(Object.values(layout.nodes))
                        .transition()
                        .duration(200)
                        .attr('cx', () => centerPoint.x)
                        .attr('cy', () => centerPoint.y);
                    d3.selectAll(selection.lines)
                        .data(layout.edges)
                        .transition()
                        .duration(200)
                        .attr('x1', () => centerPoint.x)
                        .attr('x2', () => centerPoint.x)
                        .attr('y1', () => centerPoint.y)
                        .attr('y2', () => centerPoint.y)
                        .on('end', () => setCollapsed(true));
                }
            }
        },
        [
            centerPoint.x,
            centerPoint.y,
            layout.edges,
            layout.nodes,
            selectElements,
            setCollapsed
        ]
    );

    const updateLayout = useCallback(
        (element: SVGElement | null) => {
            if (!collapsed && element) {
                applyLayout(element);
            }
        },
        [applyLayout, collapsed]
    );
    const elements = useMemo(() => {
        let centerCircle,
            circles,
            lines,
            innerCircle,
            outerCircle = null;
        if (collapsed) {
            centerCircle = (
                <circle
                    onMouseEnter={() => setCollapsed(false)}
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={nodeRadius}
                    fill={'black'}
                />
            );
        } else {
            circles = Object.values(layout.nodes).map((node, i) => {
                return (
                    <EgographNode
                        key={node.id}
                        centerPoint={centerPoint}
                        nodeRadius={nodeRadius}
                        nodeAtom={nodeAtoms[i]}
                        fill={String(colorScale(node.numEdges))}
                    />
                );
            });
            innerCircle = (
                <circle
                    id={'background'}
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={innerRadius}
                    fill={'none'}
                    stroke={'lightgray'}
                />
            );
            outerCircle = (
                <circle
                    id={'background'}
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={outerRadius}
                    fill={'none'}
                    stroke={'lightgray'}
                />
            );

            lines = layout.edges.map((edge) => {
                const isVisible =
                    layout.nodes[edge.sourceIndex].hovered ||
                    layout.nodes[edge.targetIndex].hovered;
                return (
                    <line
                        key={String(edge.source) + String(edge.target)}
                        x1={centerPoint.x}
                        x2={centerPoint.x}
                        y1={centerPoint.y}
                        y2={centerPoint.y}
                        stroke={isVisible ? 'black' : 'none'}
                    />
                );
            });
        }
        return (
            <g
                ref={(node) => updateLayout(node)}
                transform={
                    'translate(' +
                    String(-egoGraphSize / 2 + nodeRadius) +
                    ',' +
                    String(-egoGraphSize / 2 + nodeRadius) +
                    ')'
                }
                onMouseLeave={(event) => removeLayout(event)}
            >
                <circle
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={egoGraphSize / 2}
                    id={'background'}
                    fill={'none'}
                    pointerEvents={'visible'}
                />
                {innerCircle}
                {outerCircle}
                {lines}
                {circles}
                {centerCircle}
            </g>
        );
    }, [
        centerPoint,
        collapsed,
        colorScale,
        egoGraphSize,
        innerRadius,
        layout.edges,
        layout.nodes,
        nodeAtoms,
        nodeRadius,
        outerRadius,
        removeLayout,
        setCollapsed,
        updateLayout
    ]);

    return elements;
};
export default Egograph;
