import { useEffect } from 'react';
import './App.css';
import { useAtom, useSetAtom } from 'jotai';
import {
    AppBar,
    Toolbar,
    IconButton,
    CircularProgress,
    Box,
    createTheme,
    Backdrop,
    Tooltip
} from '@mui/material';
import ThemeProvider from '@mui/material/styles/ThemeProvider';
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
    startDataOverview,
    serverBusyAtom,
    selectedExampleAtom
} from './apiCalls.ts';
import EgoNetworkNetworkOverviewViewer from './components/overview_component/egoNetworkNetworkOverviewViewer.tsx';
import DrawerElement from './components/drawerElement/DrawerElement.tsx';
import { drawerShownAtom } from './components/drawerElement/DrawerElementStore.ts';
import LogoText from './assets/LogoPathWhite.svg';
import LogoBlue from './assets/LogoBlue.svg';

import { GitHub } from '@mui/icons-material';
import LandingPage from './components/HomePage/LandingPage.tsx';
import {
    InfoComponent,
    infoContentAtom,
    infoTitleAtom
} from './components/HomePage/InfoComponent.tsx';
import { InformationVariantCircle } from 'mdi-material-ui';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

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
    const [egoNetworkNetworkOverviewData, getEgoNetworkNetworkOverviewData] =
        useAtom(getEgoNetworkNetworkOverviewAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    const setStateDrawer = useSetAtom(drawerShownAtom);
    const [, setInfoTitle] = useAtom(infoTitleAtom);
    const [, setInfoContent] = useAtom(infoContentAtom);

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
        tarNode !== '' &&
        egoNetworkNetworkOverviewData.nodes.length > 0
    ) {
        return (
            <Grid container sx={{ height: '99vh', width: '100vw' }}>
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
                    <InfoComponent></InfoComponent>

                    {/* <!-- First Row --> */}
                    <Grid xs={12} sx={{ height: '5%', width: '100%' }}>
                        <DrawerElement />
                        {/* <!-- Content for the first row --> */}
                        <AppBar
                            className="header-title"
                            position="static"
                            style={{
                                display: 'flex',
                                height: '100%'
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
                                <span style={{ marginLeft: 'auto' }}>
                                    <IconButton
                                        onClick={() => {
                                            setInfoTitle('protegonist');
                                            setInfoContent('protegonist');
                                        }}
                                    >
                                        <Tooltip title="Information about ProtEGOnist">
                                            <InformationVariantCircle />
                                        </Tooltip>
                                    </IconButton>
                                    <IconButton
                                        size="large"
                                        edge="start"
                                        color="inherit"
                                        onClick={() =>
                                            window.open(
                                                'https://github.com/UniTuebingen-BDVA/BiovisChallenge2023'
                                            )
                                        }
                                    >
                                        <GitHub />
                                    </IconButton>
                                </span>
                            </Toolbar>
                        </AppBar>
                    </Grid>

                    {/* <!-- Second Row --> */}
                    <Grid
                        container
                        columns={16}
                        spacing={1}
                        xs={12}
                        sx={{ height: '96%', width: '100%' }}
                    >
                        {/* <!-- First Column --> */}
                        <Grid container xs={7} sx={{ height: '100%' }}>
                            <Grid
                                xs={16}
                                sx={{
                                    height: '55%',
                                    textAlign: 'center'
                                }}
                            >
                                {/* <!-- Content for the first column, first row --> */}
                                <EgoNetworkNetworkOverviewViewer />
                            </Grid>
                            <Grid
                                xs={16}
                                sx={{
                                    height: '45%',
                                    textAlign: 'center'
                                }}
                                // style={{ minWidth: '80%', width: '80%' }}
                            >
                                {/* */}
                                {/* <!-- Content for the first column, second row --> */}
                                <RadarChartViewer
                                    intersectionData={intersectionData}
                                    tarNode={tarNode}
                                />
                            </Grid>
                        </Grid>

                        {/* <!-- Second Column --> */}
                        <Grid container xs={9} sx={{ height: '100%' }}>
                            <Grid
                                xs={16}
                                sx={{ height: '100%', textAlign: 'center' }}
                            >
                                {/* <Typography
                                    component={'span'}
                                    style={{
                                        color: 'black',
                                        textAlign: 'center'
                                    }}
                                >
                                    Ego-graph subnetwork
                                </Typography> */}

                                {/* <!-- Content for the second column, first row --> */}
                                {/* <EgoGraphViewer />  */}
                                <EgoNetworkNetworkViewer />
                            </Grid>
                        </Grid>
                    </Grid>
                </ThemeProvider>
            </Grid>
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
        return <LandingPage />;
    }
}

export default App;
