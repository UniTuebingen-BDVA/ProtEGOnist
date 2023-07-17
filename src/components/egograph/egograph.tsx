import React, {useCallback, useMemo, useState} from "react";
import * as d3 from "d3";
import {useAtom} from "jotai";

import {graphAtom, nodesAtomsAtom, numEdgesMinMax} from "./egoStore.ts";
import {EgographNode} from "./egographNode.tsx";


const Egograph = () => {
    const egoGraphSize = 200;
    const radius = 5
    const [layout] = useAtom(graphAtom);
    const [nodeAtoms] = useAtom(nodesAtomsAtom);
    const [numEdges]=useAtom(numEdgesMinMax)
    const [collapsed, setCollapsed] = useState(true);
    const colorScale= d3.scaleLinear<string,number>().range(["white", "black"]).domain(numEdges)
    const nodeRadius = useMemo(() => {
        return (radius > layout.maxradius ? layout.maxradius : radius)
    }, [layout.maxradius]);
    const centerPoint = useMemo(() => {
        return ({x: egoGraphSize / 2 - nodeRadius, y: egoGraphSize / 2 - nodeRadius})
    }, [nodeRadius])
    const translate = {x: -egoGraphSize / 2 + radius, y: -egoGraphSize / 2 + radius}

    const selectElements = useCallback((element: ParentNode) => {
        const childNodes = element.children;
        if (childNodes && childNodes.length > 1) {
            const circles = [...childNodes].filter(d => d.nodeName === "circle" && d.id != "background");
            const lines = [...childNodes].filter(d => d.nodeName === "line");
            return {circles, lines}
        }
    }, [])
    const applyLayout = useCallback((element: SVGElement) => {
        const selection = selectElements(element);
        if (selection) {
            d3.selectAll(selection.circles)
                .data(layout.nodes)
                .transition()
                .duration(200)
                .attr("cx", d => d.cx)
                .attr("cy", d => d.cy)
            d3.selectAll(selection.lines)
                .data(layout.edges)
                .transition()
                .duration(200)
                .attr("x1", d => d.x1)
                .attr("x2", d => d.x2)
                .attr("y1", d => d.y1)
                .attr("y2", d => d.y2)
        }
    }, [layout, selectElements]);
    const removeLayout = useCallback((event: React.MouseEvent) => {
        if (event.target && event.target instanceof SVGElement && event.target.parentNode) {
            const selection = selectElements(event.target.parentNode);
            if (selection) {
                d3.selectAll(selection.circles)
                    .data(layout.nodes).transition()
                    .duration(200)
                    .attr("cx", () => centerPoint.x)
                    .attr("cy", () => centerPoint.y)
                d3.selectAll(selection.lines)
                    .data(layout.edges).transition()
                    .duration(200)
                    .attr("x1", () => centerPoint.x)
                    .attr("x2", () => centerPoint.x)
                    .attr("y1", () => centerPoint.y)
                    .attr("y2", () => centerPoint.y)
                    .on("end", () => setCollapsed(true)
                    )
            }
        }
    }, [centerPoint, layout.edges, layout.nodes, selectElements]);

    const updateLayout = useCallback((element: SVGElement | null) => {
        if (!collapsed && element) {
            applyLayout(element);
        }
    }, [applyLayout, collapsed])
    const elements = useMemo(() => {
        let centerCircle, circles, lines = null
        if (collapsed) {
            centerCircle = <circle onMouseEnter={() => setCollapsed(false)}
                                   cx={centerPoint.x} cy={centerPoint.y} r={nodeRadius} fill={"white"}/>
        } else {
            circles = layout.nodes.map((node, i) => {
                return (<EgographNode centerPoint={centerPoint} nodeRadius={nodeRadius} nodeAtom={nodeAtoms[i]} fill={String(colorScale(node.numEdges))}/>)
            })
            lines = layout.edges.map(edge => {
                let isVisible = false;
                if (edge.target !== -1) {
                    isVisible = layout.nodes[edge.source].hovered || layout.nodes[edge.target].hovered;
                } else {
                    isVisible = layout.nodes[edge.source].hovered;
                }
                return <line key={String(edge.source) + String(edge.target)} x1={centerPoint.x} x2={centerPoint.x}
                             y1={centerPoint.y}
                             y2={centerPoint.y} stroke={isVisible ? "white" : "none"}/>
            })
        }
        return (<g ref={(node) => updateLayout(node)}
                   transform={"translate(" + String(translate.x) + "," + String(translate.y) + ")"}
                   onMouseLeave={(event) => removeLayout(event)}>
            <circle cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={egoGraphSize / 2}
                    id={"background"}
                    fill={"none"}
                    pointerEvents={"visible"}/>
            {lines}
            {circles}
            {centerCircle}
        </g>)
    }, [centerPoint, collapsed, colorScale, layout.edges, layout.nodes, nodeAtoms, nodeRadius, removeLayout, translate.x, translate.y, updateLayout])

    return (elements)
}
export default Egograph;