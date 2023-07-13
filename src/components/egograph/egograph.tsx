import {egoGraph} from "../../App.tsx";
import React, {useCallback, useMemo, useState} from "react";
import {calculateEgoLayout} from "./egolayout.ts";
import * as d3 from "d3";


interface EgoGraphProps {
    graph: egoGraph;
}

const Egograph = (props: EgoGraphProps) => {
    const {graph} = props;
    const [collapsed, setCollapsed] = useState(true);
    const egoGraphSize = 200;
    const radius = 5
    const layout = useMemo(() => {
        return (calculateEgoLayout(graph, egoGraphSize - 2 * radius))
    }, [graph, egoGraphSize])
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
            const circles = [...childNodes].filter(d => d.nodeName === "circle");
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
            centerCircle = <circle cx={centerPoint.x} cy={centerPoint.y} r={nodeRadius} fill={"white"}/>
        } else {
            circles = layout.nodes.map(node => {
                return (<circle key={node.id} cx={centerPoint.x} cy={centerPoint.y} r={nodeRadius} fill={"white"}/>)
            })
            lines = layout.edges.map(edge => {
                return <line key={String(edge.source) + String(edge.target)} x1={centerPoint.x} x2={centerPoint.x}
                             y1={centerPoint.y}
                             y2={centerPoint.y} stroke={"white"}/>
            })
        }
        return (<g ref={(node) => updateLayout(node)}
                   transform={"translate(" + String(translate.x) + "," + String(translate.y) + ")"}
                   onMouseEnter={() => setCollapsed(false)}
                   onMouseLeave={(event) => removeLayout(event)}>
            {circles}
            {lines}
            {centerCircle}
        </g>)
    }, [centerPoint.x, centerPoint.y, collapsed, layout.edges, layout.nodes, nodeRadius, removeLayout, translate.x, translate.y, updateLayout])

    return (elements)
}
export default Egograph;