import { useEffect } from 'react';
import './App.css';

import { useAtom } from 'jotai';
import { CircularProgress, Box, createTheme } from '@mui/material';
import ThemeProvider from '@mui/material/styles/ThemeProvider';

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
    selectedExampleAtom
} from './apiCalls.ts';
import EgoNetworkNetworkOverviewViewer from './components/overview_component/egoNetworkNetworkOverviewViewer.tsx';
import LogoBlue from './assets/LogoBlue.svg';

import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { MainPage } from './components/HomePage/MainPage.tsx';
import TabsElements from './components/HomePage/TabsElements.tsx';

function App() {
    const [selectedExample] = useAtom(selectedExampleAtom);
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
            <MainPage columns={16} alignContent="center" theme={theme}>
                {/* <!-- First Column --> */}
                <Grid container xs={7} sx={{ height: '100%' }}>
                    <Grid
                        p={1}
                        pr={0}
                        xs={16}
                        sx={{
                            height: '55%',
                            textAlign: 'center'
                        }}
                    >
                        <EgoNetworkNetworkOverviewViewer />
                    </Grid>
                    <Grid
                        p={1}
                        pr={0}
                        pt={0}
                        xs={16}
                        sx={{
                            height: '45%',
                            textAlign: 'center'
                        }}
                    >
                        <RadarChartViewer
                            intersectionData={intersectionData}
                            tarNode={tarNode}
                        />
                    </Grid>
                </Grid>

                {/* <!-- Second Column --> */}
                <Grid container xs={9} sx={{ height: '100%' }}>
                    <Grid
                        p={1}
                        xs={16}
                        sx={{ height: '100%', textAlign: 'center' }}
                    >
                        <EgoNetworkNetworkViewer />
                    </Grid>
                </Grid>
            </MainPage>
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
            <MainPage columns={12} alignContent={'flex-start'} theme={theme}>
                <TabsElements />
            </MainPage>
        );
    }
}

export default App;
