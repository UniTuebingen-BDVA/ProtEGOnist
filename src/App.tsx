import { useEffect } from 'react';
import './App.css';
import { useAtom,useSetAtom } from 'jotai';
import { AppBar, Toolbar, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import EgoGraphViewer from './components/egograph/egographViewer.tsx';
import {
    getEgographBundleAtom,
    getEgoNetworkNetworkAtom,
    getRadarAtom,
    getTableAtom
} from './apiCalls.ts';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import { egoGraphBundleAtom } from './components/egograph/egoGraphBundleStore.ts';
import EgoNetworkNetworkViewer from './components/egoNetworkNetwork/egoNetworkNetworkViewer.tsx';


function App() {
    const [tableData, getTableData] = useAtom(getTableAtom);
    const getEgoGraphBundle = useSetAtom(getEgographBundleAtom);
    const [egoGraphBundle] = useAtom(egoGraphBundleAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [_egoNetworkNetworkData, getEgoNetworkNetworkData] = useAtom(
        getEgoNetworkNetworkAtom
    );
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    useEffect(() => {
        getTableData();
        setTarNode('Q9Y625');
        getRadarData('Q9Y625');
        getEgoNetworkNetworkData([
            'P07093',
            'P30533',
            'Q9Y625',
            'Q15369',
            'Q9H3U1'
        ]);
        getEgoGraphBundle(['P07093', 'P30533', 'Q9Y625']);
    }, [
        getTableData,
        getRadarData,
        setTarNode,
        getEgoGraphBundle,
        getEgoNetworkNetworkData
    ]);
    if (
        // check if all data is loaded (not empty)
        tableData.rows.length > 0 && // tableData
        egoGraphBundle.nodes.length > 0 && // egograph
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
                                width: '33%',
                                minWidth: '33%'
                            }}
                        >
                            <div>
                                {/* <!-- Content for the first column, first row --> */}
                                <TabViewer />
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
                            style={{ flex: 2, width: '67%' }}
                        >
                            <div>
                                {/* <!-- Content for the second column, first row --> */}
                                <EgoGraphViewer />
                            </div>
                        </div>
                        <div
                            className="column"
                            style={{ flex: 2, width: '67%' }}
                        >
                            <div>
                                {/* <!-- Content for the second column, first row --> */}
                                {/* <EgoGraphViewer /> */}
                                <EgoNetworkNetworkViewer />
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    } else return null;
}

export default App;
