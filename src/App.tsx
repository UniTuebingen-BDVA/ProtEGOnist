import { useEffect, useState } from "react";
import "./App.css";
import axios, { AxiosResponse } from "axios";
import { intersectionDatum } from "./egoGraphSchema";
import RadarChart from "./components/radarchart/radarChart";

function App() {
  const [intersectionData, setIntersectionData] = useState<{
    [name: string | number]: intersectionDatum;
  } | null>(null);
  const [tarNode, setTarNode] = useState<string | null>(null);
  useEffect(() => {
    axios
      .get<{
        intersectionData: { [name: string | number]: intersectionDatum };
        tarNode: string;
      }>("/api/testEgoRadar")
      .then((response) => {
        console.log(response.data);
        setIntersectionData(response.data.intersectionData);
        setTarNode(response.data.tarNode);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);
  const posX = 500;
  const posY = 500;
  return intersectionData !== null && tarNode !== null ? (
    <svg width={posX * 2} height={posY * 2}>
      <g transform={"translate(" + String(posX) + "," + String(posY) + ")"}>
        <RadarChart intersectionData={intersectionData} tarNode={tarNode} />
      </g>
    </svg>
  ) : null;
}

export default App;
