import { useEffect } from 'react';
import './App.css';
import { useAtom } from 'jotai';
import { AppBar, Toolbar, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import EgoNetworkNetworkViewer from './components/egoNetworkNetwork/egoNetworkNetworkViewer.tsx';
import { selectedProteinsAtom } from './components/selectionTable/tableStore.tsx';
import {
    getEgoNetworkNetworkAtom,
    getRadarAtom,
    getTableAtom, 
    getEgoNetworkNetworkOverviewAtom
} from './apiCalls.ts';
import EgoNetworkNetworkOverviewViewer from './components/overview_component/egoNetworkNetworkOverviewViewer.tsx';
import { get } from 'optics-ts/interop';

function App() {
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [_selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [_egoNetworkNetworkData, getEgoNetworkNetworkData] = useAtom(
        getEgoNetworkNetworkAtom
    );
    const [_egoNetworkNetworkOverviewData, getEgoNetworkNetworkOverviewData] = useAtom(
        getEgoNetworkNetworkOverviewAtom
    );
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    const startDataOverview = ['Q9ULU4', 'P63279', 'Q14157', 'Q9UBT2', 'O95881', 'Q13263', 'P12270', 'Q99805', 'P23193', 'O75347', 'P37837', 'P53597', 'O43752', 'Q13586', 'Q9UNL2', 'P37108', 'Q7KZF4', 'O75940', 'Q92922', 'Q9GZT3', 'P05141', 'O43765', 'Q9UBE0', 'P46782', 'P63220', 'P62263', 'P05387', 'P62910', 'P47914', 'P83731', 'P62829', 'P30050', 'Q9GZR2', 'Q14498', 'Q96PZ0', 'Q9Y3E5', 'Q06124', 'Q8WWY3', 'Q9UMS4', 'P78527', 'P14314', 'O43447', 'P19387', 'Q8TCS8', 'Q9H307', 'Q13492', 'P30086', 'Q15102', 'P49790', 'P57740', 'O15226', 'O95168', 'Q96EL3', 'Q8N983', 'Q96DV4', 'P46013', 'Q9BTE3', 'Q14566', 'P31153', 'Q9UNF1', 'Q8NC56', 'Q13751', 'Q8IYS2', 'O95373', 'P11142', 'P61978', 'P52789', 'Q6ZRV2', 'O75477', 'Q9NPA0', 'Q15369', 'Q15370', 'P42126', 'P51452', 'Q9NXW2', 'Q9UBS4', 'Q96HY7', 'Q92841', 'Q16850', 'Q13618', 'Q99829', 'P20674', 'Q14008', 'Q5SW79', 'Q99459', 'Q01518', 'Q9UBB4', 'P61421', 'P52565', 'P00568', 'Q9NRN7']
    useEffect(() => {
        getTableData();
        setTarNode('Q9Y625');
        getRadarData('Q9Y625');
        // TODO it seems like the http-get of the table atom leads to the problem that the initial set of the selectedProteinsAtom is not correctly selected in the table
        setSelectedProteins(['P07093', 'P30533', 'Q9Y625', 'Q15369', 'Q9H3U1']) 
        getEgoNetworkNetworkOverviewData(startDataOverview);
    }, [
        getTableData,
        getRadarData,
        setTarNode,
        getEgoNetworkNetworkData, 
        getEgoNetworkNetworkOverviewData
    ]);
    if (
        // check if all data is loaded (not empty)
        tableData.rows.length > 0 && // tableData
        Object.keys(intersectionData).length > 0 && // radarData
        tarNode !== ''
    ) {
        return (
            
                <div className="container">
                    {/* <!-- First Row --> */}
                    <div className="row" style={{ display: 'flex', height: '5%' }}
 >
                        <div className="column"
                            style={{
                                flex: "1 1 0px",
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/* <!-- Content for the first row --> */}
                            <AppBar
                                className="header-title"
                                style={{ display: 'flex', height: '5%' }}
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
                        </div>
                    </div>
                    <div className="row" style={{minHeight:"60%"}} >
                    <div className='column' style={{width:"100%", height:"100%", flex:"1 1 0px"}} >
                        <div>
                            <EgoNetworkNetworkOverviewViewer/>
                        </div>
                        </div>
                    </div>
                    {/* <!-- Second Row --> */}
                    <div className="row">
                        {/* <!-- First Column --> */}
                         <div
                            className="column"
                            style={{
                                flex: 1,
                                minHeight: '100%',
                                height: '100%',
                                width: '45%',
                                minWidth: '45%'
                            }}
                        >
                            <div>
                                {/* <!-- Content for the first column, first row --> */}
                               <div>
                                HERE COMES THE OVERVIEW
                               </div>
                            </div>
                            <div>
                                {/* <!-- Content for the first column, second row --> */}
                                <RadarChartViewer
                                    intersectionData={intersectionData}
                                    tarNode={tarNode}
                                />
                            </div>
                        </div>

                        {/* <!-- Second Column --> */}
                        <div
                            className="column"
                            style={{ flex: 2, width: '55%' }}
                        >
                            <div >
                                {/* <!-- Content for the second column, first row --> */}
                                {/* <EgoGraphViewer />  */}
                                <EgoNetworkNetworkViewer />
                            </div>
                        </div>
                    </div>

                    {/* <!-- Third Row --> */}
                    <div className="row">
                        
                    
                                <TabViewer />
                    </div>
                            
                </div>

                       
        );
    } else return null;
}

export default App;
