import { useEffect, useState } from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import { calculateEgoLayout } from './components/egograph/egolayout.ts';
import { useAtom } from 'jotai';
import { egoGraph, intersectionDatum } from './egoGraphSchema';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import { Grid, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import { AppBar, Toolbar } from '@mui/material';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import EgoGraphViewer from './components/egograph/egographViewer.tsx';



function App() {
    const [egoGraph, setEgoGraph] = useAtom(graphAtom);
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);

    const [intersectionData, setIntersectionData] = useState<{
        [name: string | number]: intersectionDatum;
    } | null>(null);

    const [tarNode, setTarNode] = useState<string | null>(null);
    useEffect(() => {
        axios
            .get<egoGraph>('/api/test_data_egograph')
            .then((response: AxiosResponse<egoGraph>) => {
                setEgoGraph(
                    calculateEgoLayout(response.data, innerRadius, outerRadius)
                );
            })
            .catch((error) => {
                console.log(error);
            });
        axios
            .get<{
                intersectionData: {
                    [name: string | number]: intersectionDatum;
                };
                tarNode: string;
            }>('/api/testEgoRadar')
            .then((response) => {
                setIntersectionData(response.data.intersectionData);
                setTarNode(response.data.tarNode);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [innerRadius, outerRadius, setEgoGraph]);
    
    if (egoGraph !== null && intersectionData !== null && tarNode !== null) {
        return (
            <> 
            <AppBar className='header-title' style={{ display:"flex", height:"5%", position:"fixed"}}>
                <Toolbar variant="dense">
                    <Typography   variant="h6" color="inherit" component="div">
                      ProtEGOnist
                    </Typography>
                </Toolbar>
            </AppBar> 
            <div style={{height: "95vh", marginTop: "5vh"}}>
            <Grid container alignItems={"stretch"} direction={"row"} spacing="10" justifyContent="space-between" style={{ minHeight:"100%", marginBottom:"5vh"}}>
                    <Grid item md={4}>
                        <Grid container alignItems={"stretch"} direction={"column"} justifyContent="space-between" style={{height:"100%",}} 
                            rowSpacing={3}>
                            <Grid item md={6}>
                                <TabViewer/>
                            </Grid>
                            <Grid item md={6} >
                                <RadarChartViewer intersectionData={intersectionData} tarNode={tarNode}/>
                            </Grid>
                        
                        </Grid>
                    </Grid>
                    <Grid item md={8}>
                        <EgoGraphViewer/> 
                    </Grid>
                </Grid>            
            </div>
                
            </>
        );
    } else return null;
}

export default App;
