import * as d3 from 'd3';
import {polarToCartesian} from "../../UtilityFunctions.ts";
import {egoGraph} from "../../App.tsx";
import {useState} from "react";



interface EgoGraphProps {
    graph: egoGraph;
}

const Egograph = (props: EgoGraphProps) => {
    const {graph} = props;
    const [collapsed,setCollapsed]=useState(false);
    const size = collapsed ? 10 : 200;
    const maxNodeRadius=5
    const radius = 30;
    const x = d3.scaleBand()
        .range([0, 360])
        .domain(graph.nodes.map(d => d.id))
    const calculatedRadius = radius / (Math.sin((180 - x.bandwidth()) / 2)) * Math.sin(x.bandwidth()) / 2;
    const nodeRadius=maxNodeRadius>calculatedRadius?calculatedRadius:maxNodeRadius;
    const arcs = graph.nodes.map(node => {
        const circleCenter = polarToCartesian(size / 2, size / 2, radius, x(node.id));
        return (<circle cx={circleCenter.x} cy={circleCenter.y} r={nodeRadius} fill={"white"}/>)
    })

    return (<svg width={size} height={size} onMouseEnter={()=>setCollapsed(false)} onMouseLeave={()=>setCollapsed(true)}>
        <circle cx={size/2} cy={size/2} r={maxNodeRadius} fill={"white"}/>
        {arcs}
    </svg>)
}
export default Egograph;