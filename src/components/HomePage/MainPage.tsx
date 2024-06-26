import { ThemeProvider } from '@mui/material/styles';
import { GitHub } from '@mui/icons-material';
import {
    Backdrop,
    CircularProgress,
    AppBar,
    Tooltip,
    Toolbar,
    IconButton,
    Theme
} from '@mui/material';
import { InformationVariantCircle } from 'mdi-material-ui';
import DrawerElement from '../drawerElement/DrawerElement';
import { InfoComponent, infoContentAtom, infoTitleAtom } from './InfoComponent';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useAtom, useSetAtom } from 'jotai';
import MenuIcon from '@mui/icons-material/Menu';

import { chosenSetAtom, serverBusyAtom } from '../../apiCalls';
import { drawerShownAtom } from '../drawerElement/DrawerElementStore';
import LogoText from '../../assets/LogoPathWhite.svg';
import ContextMenu from '../utilityComponents/ContextMenu';

type mainPageProps = {
    columns: number;
    theme: Partial<Theme> | ((outerTheme: Theme) => Theme);
    alignContent: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    children: React.ReactNode;
};

export const MainPage = (props: mainPageProps) => {
    const [serverBusy] = useAtom(serverBusyAtom);
    const setStateDrawer = useSetAtom(drawerShownAtom);
    const [, setInfoTitle] = useAtom(infoTitleAtom);
    const [, setInfoContent] = useAtom(infoContentAtom);
    const [chosenSet] = useAtom(chosenSetAtom);
    let datasetLabel = '';
    if (chosenSet === 'IEEE') {
        datasetLabel = 'Data: IEEE VIS Co-Author Network (Isenberg et al., 2016)';
    } else if (chosenSet === 'ecoli') {
        datasetLabel =
            'Data: Full E. coli K12 PPI obtained from STRING (Szklarczyk et al, 2015)';
    } else if(chosenSet==='string'){
        datasetLabel = "Data: DeeProM (Gonçalves et al., 2022)"
    }
    return (
        <Grid container sx={{ height: '100vh', maxHeight:'100vh', width: '100vw',overflow:"hidden" }}>
            <ContextMenu />
            <ThemeProvider theme={props.theme}>
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
                <Grid
                    container
                    alignContent={'center'}
                    justifyContent={'center'}
                    sx={{ height: '5%', width: '100%' }}
                >
                    <DrawerElement />
                    {/* <!-- Content for the first row --> */}
                    <AppBar
                        className="header-title"
                        position="sticky"
                        sx={{
                            height: '100%'
                        }}
                    >
                        <Toolbar variant="dense">
                            {chosenSet !== null ? (
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
                            ) : null}
                            <img src={LogoText} style={{ height: '60%' }} />
                            <span style={{ marginLeft: '50px' }}>
                                {datasetLabel}
                            </span>
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
                    alignContent={props.alignContent}
                    columns={props.columns}
                    spacing={0}
                    sx={{
                        height: '95%',
                        width: '100%'
                    }}
                >
                    {props.children}
                </Grid>
            </ThemeProvider>
        </Grid>
    );
};
