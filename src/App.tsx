import {useEffect, useState} from 'react'
import './App.css'
import axios, {AxiosResponse} from "axios";
import Egograph from "./components/egograph/egograph.tsx";
import {calculateEgoLayout} from "./components/egograph/egolayout.ts";
import {useAtom} from "jotai";
import {intersectionDatum, egoGraph} from "./egoGraphSchema";
import {graphAtom} from "./components/egograph/egoStore.ts";
import {graphSizeAtom, innerRadiusAtom, outerRadiusAtom} from "./components/egograph/networkStore.ts";
import RadarChart from "./components/radarchart/radarChart";


function App() {
    const [egoGraph, setEgoGraph] = useAtom(graphAtom);
    const [graphSize] = useAtom(graphSizeAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [intersectionData, setIntersectionData] = useState<{
        [name: string | number]: intersectionDatum;
    } | null>(null);
    const [tarNode, setTarNode] = useState<string | null>(null);
    useEffect(() => {
        axios.get<egoGraph>("/api/test_data_egograph").then((response: AxiosResponse<egoGraph>) => {
            setEgoGraph(calculateEgoLayout(response.data, innerRadius, outerRadius))
        }).catch((error) => {
                console.log(error)
            }
        )
        axios
            .get<{
                intersectionData: { [name: string | number]: intersectionDatum };
                tarNode: string;
            }>("/api/testEgoRadar")
            .then((response) => {
                setIntersectionData(response.data.intersectionData);
                setTarNode(response.data.tarNode);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [innerRadius, outerRadius, setEgoGraph])
    if (egoGraph !== null && intersectionData !== null && tarNode !== null) {
        const posX = graphSize / 2;
        const posY = graphSize / 2;
        return (
            <>
                <svg width={posX * 2} height={posY * 2}>
                    <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
                        <RadarChart intersectionData={intersectionData} tarNode={tarNode}/>
                    </g>
                </svg>
                <svg width={posX*2} height={posY*2}>
                    <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
                        <Egograph/>
                    </g>
                </svg>

            </>
        )
    } else return null;
}

export default App;
