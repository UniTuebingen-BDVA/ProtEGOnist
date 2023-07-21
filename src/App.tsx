import { useEffect } from 'react';
import './App.css';
import Egograph from './components/egograph/egograph.tsx';
import { useAtom } from 'jotai';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import RadarChart from './components/radarchart/radarChart';
import SelectionTable from './components/selectionTable/selectionTable';
import { getEgographAtom, getRadarAtom } from './apiCalls.ts';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import { getTableAtom } from './apiCalls.ts';

function App() {
    // const [egoGraph, setEgoGraph] = useAtom(graphAtom);
    const [graphSize] = useAtom(graphSizeAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [egoGraph, getEgograph] = useAtom(getEgographAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    useEffect(() => {
        getTableData().catch((error) => {
            console.log(error, `couldn't get table data`);
        });
        getEgograph('Q9Y625').catch((error) => {
            console.log(error, `couldn't get initial egograph with ID Q9Y625`);
        });
        setTarNode('Q9Y625');
        getRadarData('Q9Y625').catch((error) => {
            console.log(error, `couldn't get radar with ID 'Q9Y625'`);
        });
    }, [
        innerRadius,
        outerRadius,
        getEgograph,
        getTableData,
        getRadarData,
        setTarNode
    ]);
    if (
        // check if all data is loaded (not empty)
        tableData.rows.length > 0 && // tableData
        egoGraph.nodes.length > 0 && // egograph
        Object.keys(intersectionData).length > 0 && // radarData
        tarNode !== ''
    ) {
        const posX = graphSize / 2;
        const posY = graphSize / 2;
        return (
            <>
                <SelectionTable
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
                        getRadarData(selectedName).catch((error) => {
                            console.log(
                                error,
                                `couldn't get radar with ID ${selectedID}`
                            );
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
                        <RadarChart baseRadius={posX - 30} />
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
