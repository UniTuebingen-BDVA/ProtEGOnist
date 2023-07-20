import { useEffect, useState } from 'react';
import './App.css';
import axios, { AxiosResponse } from 'axios';
import Egograph from './components/egograph/egograph.tsx';
import { calculateEgoLayout } from './components/egograph/egolayout.ts';
import { useAtom } from 'jotai';
import { egoGraph, intersectionDatum } from './egoGraphSchema';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import RadarChart from './components/radarchart/radarChart';
import { Grid, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import { AppBar, Toolbar } from '@mui/material';



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
        const posX = graphSize / 2;
        const posY = graphSize / 2;
        
        
        return (
            <> 
            <AppBar className='header-title' style={{ display:"flex", height:"5vh", position:"fixed"}}>
                <Toolbar variant="dense">
                    <Typography   variant="h6" color="inherit" component="div">
                      ProtEGOnist
                    </Typography>
                </Toolbar>
            </AppBar> 
            <div style={{ display:'flex'}}>
                <Grid container  direction={"row"} spacing="10" justifyContent="flex-start" style={{height:"95vh", marginTop:"5vh"}}>
                    <Grid item md={4}>
                        <Grid container direction={"column"} justifyContent="space-between" style={{height:"95vh"}} 
                            rowSpacing={3}>
                            <Grid item md={6}>
                                <TabViewer/>
                            </Grid>
                            <Grid item md={6}>
                                <div style={{ width: '100%', textAlign:"center", alignItems: "center", justifyContent: "center", backgroundColor:"white" }} >
                                    <svg style={{"display":"flex"}} width={posX * 2} height={posY * 2}>
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
                                </div>
                            </Grid>
                        
                        </Grid>
                    </Grid>
                    <Grid item md={8}>
                    <div style={{ width: '100%', alignItems: "center", justifyContent: "center", backgroundColor:"white" }} >
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
                    </div>
                    </Grid>
                </Grid>
            
            </div>          
            
            </>
        );
    } else return null;
}

export default App;
