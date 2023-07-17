import {useEffect} from 'react'
import './App.css'
import axios, {AxiosResponse} from "axios";
import Egograph from "./components/egograph/egograph.tsx";
import {calculateEgoLayout} from "./components/egograph/egolayout.ts";
import {useAtom} from "jotai";
import {graphAtom} from "./components/egograph/egoStore.ts";

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
    const [egoGraph,setEgoGraph]=useAtom(graphAtom);
    useEffect(() => {
        axios.get<egoGraph>("/api/test_data_egograph").then((response:AxiosResponse<egoGraph>) => {
            setEgoGraph(calculateEgoLayout(response.data,200-10))
        }).catch((error) => {
                console.log(error)
            }
        )
    }, [setEgoGraph])
    if (egoGraph!==null) {
        const posX = 100;
        const posY = 100;
        return (
            <svg width={posX * 2} height={posY * 2}>
                <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
                        <Egograph/>
                </g>
            </svg>
        )
    } else return null;
}

export default App
