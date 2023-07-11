import {egoGraph} from "../../App.tsx";
import {createRef, useMemo, useState} from "react";
import {calculateEgoLayout} from "./egolayout.ts";


interface EgoGraphProps {
    graph: egoGraph;
}

const Egograph = (props: EgoGraphProps) => {
    const {graph} = props;
    const [collapsed, setCollapsed] = useState(true);
    const ref = createRef<SVGGElement>();
    const elements = useMemo(() => {
        if (collapsed) {
            const size = 10;
            return (<g ref={ref} onMouseEnter={() => setCollapsed(false)}>
                <circle cx={0} cy={0} r={size / 2} fill={"white"}/>
            </g>)
        } else {
            const size = 200;
            const radius = 5
            const {nodes, edges, maxradius} = calculateEgoLayout(graph, size-2*radius);
            const translate = {x: -size / 2+radius, y: -size / 2+radius}
            const nodeRadius = radius > maxradius ? maxradius : radius;
            const circles = nodes.map(node => {
                return (<circle key={node.id} cx={node.cx} cy={node.cy} r={nodeRadius} fill={"white"}/>)
            })
            const lines = edges.map(edge => {
                return <line key={String(edge.source) + String(edge.target)} x1={edge.x1} x2={edge.x2} y1={edge.y1}
                             y2={edge.y2} stroke={"white"}/>
            })

            return (<g ref={ref}
                       transform={"translate(" + String(translate.x) + "," + String(translate.y) + ")"}
                       onMouseLeave={() => setCollapsed(true)}>
                <circle r={size/2} cx={size/2} cy={size/2}/>
                {circles}
                {lines}
            </g>)
        }
    }, [collapsed, graph, ref])

    return (elements)
}
export default Egograph;