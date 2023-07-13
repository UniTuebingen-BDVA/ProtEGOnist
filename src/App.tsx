import {useEffect, useState} from 'react'
import './App.css'
import axios, {AxiosResponse} from "axios";
import { intersectionDatum } from './egoGraphSchema';
import RadarChart from "./components/radarchart/radarChart";

function App() {
    const [intersectionData, setIntersectionData] = useState<{[name: (string|number)]:intersectionDatum} | null>(null)
    useEffect(() => {
        axios.get<{[name: (string|number)]:intersectionDatum}>("/api/testEgoRadar").then((response) => {
            setIntersectionData(response.data)
        }).catch((error) => {
                console.log(error)
            }
        )
    }, [])
    const posX = 500;
    const posY = 500;
    return (
        intersectionData !== null ?
            <svg width={posX*2} height={posY*2}>
                <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
                    <RadarChart intersectionData={intersectionData}/>
                </g>
            </svg> : null
    )
}

export default App
