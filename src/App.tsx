import { useEffect } from 'react';
import './App.css';
import { useAtom } from 'jotai';
import { AppBar, Toolbar, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import { getRadarAtom, getTableAtom } from './apiCalls.ts';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import EgoNetworkNetworkViewer from './components/egoNetworkNetwork/egoNetworkNetworkViewer.tsx';
import { selectedProteinsAtom } from './components/selectionTable/tableStore.tsx';

function App() {
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [_selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    useEffect(() => {
        getTableData();
        setTarNode('Q9Y625');
        getRadarData('Q9Y625');
        // TODO it seems like the http-get of the table atom leads to the problem that the initial set of the selectedProteinsAtom is not correctly selected in the table
        setSelectedProteins(['P07093', 'P30533', 'Q9Y625', 'Q15369', 'Q9H3U1']);
    }, [getTableData, getRadarData, setTarNode, setSelectedProteins]);
    if (
        // check if all data is loaded (not empty)
        tableData.rows.length > 0 && // tableData
        Object.keys(intersectionData).length > 0 && // radarData
        tarNode !== ''
    ) {
        return (
            <>
                <div className="container">
                    {/* <!-- First Row --> */}
                    <div className="row">
                        <div
                            style={{
                                flex: 1,
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
                            <div>
                                {/* <!-- Content for the second column, first row --> */}
                                {/* <EgoGraphViewer /> */}
                                <EgoNetworkNetworkViewer />
                            </div>
                        </div>
                    </div>

                    {/* <!-- Third Row --> */}
                    <div className="row">
                        
                    
                                <TabViewer />
                    </div>
                            
                </div>

                       
            </>
        );
    } else return null;
}

export default App;
