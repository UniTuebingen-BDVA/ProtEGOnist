import {useEffect, useState} from 'react'
import './App.css'
import axios from "axios";
import Egograph from "./components/egograph/egograph.tsx";

export type egoGraphNode = {
    id: string,
    name: string,
}
export type egoGraphEdge = {
    source: number,
    target: number,
}

export interface egoGraph {
    centerNode: egoGraphNode,
    nodes: egoGraphNode[],
    edges: egoGraphEdge[]
}

function App() {
    const [graph, setGraph] = useState<egoGraph | null>(null)
    useEffect(() => {
        axios.get<egoGraph>("/api/test_data_egograph").then((response) => {
            setGraph(response.data)
        }).catch((error) => {
                console.log(error)
            }
        )
    }, [])
    const posX = 100;
    const posY = 100;
    return (
        graph !== null ?
            <svg width={posX*2} height={posY*2}>
                <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
                    <Egograph graph={graph}/>
                </g>
            </svg> : null
    )
}

export default App
