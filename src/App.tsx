import { useEffect } from 'react';
import './App.css';
import InputPage from './components/HomePage/LandingPage.tsx';
import { useAtom, useSetAtom } from 'jotai';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    CircularProgress,
    Box,
    createTheme,
    ThemeProvider, Backdrop
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import EgoNetworkNetworkViewer from './components/egoNetworkNetwork/egoNetworkNetworkViewer.tsx';
import { selectedProteinsAtom } from './components/selectionTable/tableStore.tsx';
import {
    getEgoNetworkNetworkAtom,
    getRadarAtom,
    getTableAtom,
    getEgoNetworkNetworkOverviewAtom,
    startDataOverview, serverBusyAtom,
    selectedExampleAtom,
    classifyByAtom
} from './apiCalls.ts';
import EgoNetworkNetworkOverviewViewer from './components/overview_component/egoNetworkNetworkOverviewViewer.tsx';
import DrawerElement from './components/drawerElement/DrawerElement.tsx';
import { drawerShownAtom } from './components/drawerElement/DrawerElementStore.ts';
import LogoText from './assets/LogoPathWhite.svg';
import LogoBlue from './assets/LogoBlue.svg';

import { GitHub } from '@mui/icons-material';
import LandingPage from './components/HomePage/LandingPage.tsx';

function App() {
    const [selectedExample] = useAtom(selectedExampleAtom);
    const [serverBusy] = useAtom(serverBusyAtom);
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [_selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [_egoNetworkNetworkData, getEgoNetworkNetworkData] = useAtom(
        getEgoNetworkNetworkAtom
    );
    const [_egoNetworkNetworkOverviewData, getEgoNetworkNetworkOverviewData] =
        useAtom(getEgoNetworkNetworkOverviewAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    const setStateDrawer = useSetAtom(drawerShownAtom);
    const [classifyBy] = useAtom(classifyByAtom);

    const theme = createTheme({
        palette: {
            primary: {
                main: '#1f78b4'
            },
            secondary: {
                main: '#f44336'
            }
        }
    });

    useEffect(() => {
        if (selectedExample) {
            getTableData();
            //ForUseCase
            // setTarNode('P61978');
            // getRadarData('P61978');
            // Chosen starts

            // For useCase
            // setSelectedProteins(['P61978', 'O43447', 'Q14498', 'Q92922']);
            getEgoNetworkNetworkOverviewData(startDataOverview);
        }

    }, [
        selectedExample,
        getTableData,
        getRadarData,
        setTarNode,
        getEgoNetworkNetworkData,
        getEgoNetworkNetworkOverviewData,
        setSelectedProteins
    ]);
    if (
        selectedExample &&
        // check if all data is loaded (not empty)
        Object.keys(tableData.rows).length > 0 && // tableData
        Object.keys(intersectionData).length > 0 && // radarData
        tarNode !== ''
    ) {
        return (
            <ThemeProvider theme={theme}>
                <Backdrop
                    sx={{
                        color: '#fff',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                    open={serverBusy}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                <div className="container">
                    {/* <!-- First Row --> */}
                    <div
                        className="row"
                        style={{ display: 'flex', minHeight: '5%' }}
                    >
                        <DrawerElement />
                        <div
                            className="column"
                            style={{
                                flex: '1 1 0px',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/* <!-- Content for the first row --> */}
                            <AppBar
                                className="header-title"
                                style={{
                                    display: 'flex',
                                    height: '5%'
                                }}
                            >
                                <Toolbar variant="dense">
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        aria-label="menu"
                                        sx={{ mr: 2 }}
                                        onClick={() => setStateDrawer(true)}
                                    >
                                        <MenuIcon />
                                    </IconButton>
                                    <img
                                        src={LogoText}
                                        style={{
                                            height: '60%',
                                            top: '10%'
                                        }}
                                    />
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        style={{ marginLeft: 'auto' }}
                                        onClick={() =>
                                            window.open(
                                                'https://github.com/UniTuebingen-BDVA/BiovisChallenge2023'
                                            )
                                        }
                                    >
                                        <GitHub />
                                    </IconButton>
                                </Toolbar>
                            </AppBar>
                        </div>
                    </div>

                    {/* <!-- Second Row --> */}
                    <div className="row" style={{ minHeight: '95%' }}>
                        {/* <!-- First Column --> */}
                        <div
                            className="column"
                            style={{
                                flex: 1,
                                minHeight: '100%',
                                height: '100%',
                                width: '45%',
                                minWidth: '45%',
                                alignItems: 'center'
                            }}
                        >
                            <Typography style={{ color: 'black' }}>
                                Network overview: 91 ego-graphs from that cover X and Y.
                                {//TODO Add text and make it more general for any kind of network
                                    // The given nodes cover X percent of the network's nodes and Y percent of the network's edges.
                                }
                            </Typography>
                            <div
                                style={{
                                    minHeight: '45%',
                                    height: '45%',
                                    width: '100%'
                                }}
                            >
                                {/* <!-- Content for the first column, first row --> */}
                                <EgoNetworkNetworkOverviewViewer />
                            </div>
                            <Typography style={{ color: 'black' }}>
                                Neighborhood of selected node (radar center) classified by {classifyBy}

                            </Typography>
                            <div style={{ minWidth: '80%', width: '80%' }}>
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
                            style={{
                                flex: 2,
                                width: '55%'
                            }}
                        >
                            <Typography
                                style={{ color: 'black', textAlign: 'center' }}
                            >
                                Ego-graph subnetwork
                            </Typography>
                            <div>
                                {/* <!-- Content for the second column, first row --> */}
                                {/* <EgoGraphViewer />  */}
                                <EgoNetworkNetworkViewer />
                            </div>
                        </div>
                    </div>
                </div>
            </ThemeProvider>
        );
    } else if (selectedExample) {
        return (
            <ThemeProvider theme={theme}>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh'
                    }}
                >
                    <img
                        src={LogoBlue}
                        style={{
                            height: '18vh',
                            top: '41vh',
                            position: 'fixed'
                        }}
                    />
                    <CircularProgress size={'30vh'} />
                </Box>
            </ThemeProvider>
        );
    } else {
        return (
            <LandingPage />
        )

    }
}

export default App;
