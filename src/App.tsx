import { useEffect, useState } from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import Egograph from './components/egograph/egograph.tsx';
import { calculateEgoLayout } from './components/egograph/egolayout.ts';
import { useAtom } from 'jotai';
import { egoGraph, intersectionDatum } from './egoGraphSchema';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import RadarChart from './components/radarchart/radarChart';
import SelectionTable from './components/selectionTable/selectionTable';
import { getEgographAtom } from './apiCalls.ts';
import { get } from 'optics-ts';

function App() {
    // const [egoGraph, setEgoGraph] = useAtom(graphAtom);
    const [graphSize] = useAtom(graphSizeAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [egoGraph, getEgograph] = useAtom(getEgographAtom);
    const [intersectionData, setIntersectionData] = useState<{
        [name: string | number]: intersectionDatum;
    } | null>(null);
    const [tableData, setTableData] = useState<{
        rows: GridRowsProp;
        columns: GridColDef[];
    } | null>(null);
    const [tarNode, setTarNode] = useState<string | null>(null);
    useEffect(() => {
        axios
            .get<{
                rows: GridRowsProp;
                columns: GridColDef[];
            }>('/api/getTableData')
            .then(
                (
                    response: AxiosResponse<{
                        rows: GridRowsProp;
                        columns: GridColDef[];
                    }>
                ) => {
                    setTableData(response.data);
                }
            )
            .catch((error) => {
                console.log(error);
            });
        getEgograph('Q9Y625').catch((error) => {
            console.log(error, `couldn't get initial egograph with ID Q9Y625`);
        });
        axios
            .get<{
                intersectionData: {
                    [name: string | number]: intersectionDatum;
                };
                tarNode: string;
            }>('/api/testEgoRadar/Q9Y625')
            .then((response) => {
                setIntersectionData(response.data.intersectionData);
                setTarNode(response.data.tarNode);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [innerRadius, outerRadius, getEgograph]);
    if (
        egoGraph !== null &&
        intersectionData !== null &&
        tarNode !== null &&
        tableData !== null
    ) {
        const posX = graphSize / 2;
        const posY = graphSize / 2;
        return (
            <>
                <SelectionTable
                    data={tableData}
                    onRowSelectionModelChange={(newSelection) => {
                        console.log('SELECTED: ', newSelection);
                        // get the ID from the selection
                        const selectedID = newSelection[0];
                        // get the name from the tableData
                        const selectedName =
                            tableData.rows[selectedID]['UniprotID_inString'];
                        getEgograph(selectedName).catch((error) => {
                            console.log(
                                error,
                                `couldn't get egograph with ID ${selectedID}`
                            );
                        });
                        axios
                            .get<{
                                intersectionData: {
                                    [name: string | number]: intersectionDatum;
                                };
                                tarNode: string;
                            }>(`/api/testEgoRadar/${selectedName}`)
                            .then((response) => {
                                setIntersectionData(
                                    response.data.intersectionData
                                );
                                setTarNode(response.data.tarNode);
                            })
                            .catch((error) => {
                                console.log(error);
                            });
                    }}
                />
                <svg width={posX * 2} height={posY * 2}>
                    <g
                        transform={
                            'translate(' +
                            String(posX) +
                            ',' +
                            String(posY) +
                            ')'
                        }
                    >
                        <RadarChart
                            intersectionData={intersectionData}
                            tarNode={tarNode}
                            baseRadius={posX - 30}
                        />
                    </g>
                </svg>
                <svg width={posX * 2} height={posY * 2}>
                    <g
                        transform={
                            'translate(' +
                            String(posX) +
                            ',' +
                            String(posY) +
                            ')'
                        }
                    >
                        <Egograph />
                    </g>
                </svg>
            </>
        );
    } else return null;
}

export default App;
