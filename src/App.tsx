import {useEffect, useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios, {AxiosResponse} from "axios";
import Egograph from "./components/egograph/egograph.tsx";

type egoGraphNode = {
    id: string,
    name: string,
}

export interface egoGraph {
    centerNode: object,
    nodes: egoGraphNode[],
    edges: object[]
}

function App() {
    const [graph, setGraph] = useState<egoGraph | null>(null)
    useEffect(() => {
        axios.get<egoGraph>("/api/test_data_egograph").then((response) => {
            console.log(response.data)
            setGraph(response.data)
        }).catch((error) => {
                console.log(error)
            }
        )
    }, [])
    return (
        graph !== null ? <Egograph graph={graph} collapsed={false}/> : null
    )
}

export default App
