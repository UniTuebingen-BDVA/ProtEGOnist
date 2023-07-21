import { useEffect } from 'react';
import './App.css';
import Egograph from './components/egograph/egograph.tsx';
import { useAtom } from 'jotai';
import {
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import { Grid, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import { AppBar, Toolbar } from '@mui/material';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import EgoGraphViewer from './components/egograph/egographViewer.tsx';
import SelectionTable from './components/selectionTable/selectionTable';
import { getEgographAtom, getRadarAtom } from './apiCalls.ts';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import { getTableAtom } from './apiCalls.ts';

function App() {
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [egoGraph, getEgograph] = useAtom(getEgographAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    useEffect(() => {
        getTableData();
        getEgograph('Q9Y625');
        setTarNode('Q9Y625');
        getRadarData('Q9Y625');
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
        return (
            <>
                <AppBar
                    className="header-title"
                    style={{ display: 'flex', height: '5%', position: 'fixed' }}
                >
                    <Toolbar variant="dense">
                        <Typography
                            variant="h6"
                            color="inherit"
                            component="div"
                        >
                            ProtEGOnist
                        </Typography>
                    </Toolbar>
                </AppBar>
                <div style={{ height: '95vh', marginTop: '5vh' }}>
                    <Grid
                        container
                        alignItems={'stretch'}
                        direction={'row'}
                        spacing="10"
                        justifyContent="space-between"
                        style={{ minHeight: '100%', marginBottom: '5vh' }}
                    >
                        <Grid item md={4}>
                            <Grid
                                container
                                alignItems={'stretch'}
                                direction={'column'}
                                justifyContent="space-between"
                                style={{ height: '100%' }}
                                rowSpacing={3}
                            >
                                <Grid item md={6}>
                                    <TabViewer />
                                </Grid>
                                <Grid item md={6}>
                                    <RadarChartViewer
                                        intersectionData={intersectionData}
                                        tarNode={tarNode}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item md={8}>
                            <EgoGraphViewer />
                        </Grid>
                    </Grid>
                </div>
            </>
        );
    } else return null;
}

export default App;
