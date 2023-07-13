import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios, {AxiosResponse} from "axios";
import { egoGraph } from './egoGraphSchema';

function App() {
    const [graph, setGraph] = useState<egoGraph | null>(null)
    useEffect(() => {
        axios.get<egoGraph>("/api/testEgoRadar").then((response) => {
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
