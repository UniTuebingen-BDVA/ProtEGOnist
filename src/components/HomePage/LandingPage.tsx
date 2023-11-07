import TabsElements from './TabsElements';
import { GitHub } from '@mui/icons-material';
import {
    Toolbar,
    IconButton,
    AppBar,
    createTheme,
    ThemeProvider,
    Tooltip
} from '@mui/material';
import LogoText from '../../assets/LogoPathWhite.svg';
import { InformationVariantCircle } from 'mdi-material-ui';
import { useAtom } from 'jotai';
import { infoTitleAtom, infoContentAtom, InfoComponent } from './InfoComponent';

const LandingPage = () => {
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
    const [, setInfoTitle] = useAtom(infoTitleAtom);
    const [, setInfoContent] = useAtom(infoContentAtom);
    return (
        <ThemeProvider theme={theme}>
            <InfoComponent></InfoComponent>

            <div className="container">
                {/* <!-- First Row --> */}
                <div
                    className="row"
                    style={{ minHeight: '5%', maxHeight: '5%' }}
                >
                    <div
                        className="column"
                        style={{
                            flex: '1 1 0px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            maxHeight: '5%'
                        }}
                    >
                        {/* <!-- Content for the first row --> */}
                        <AppBar
                            className="header-title"
                            style={{
                                display: 'flex',
                                height: '5%',
                                maxHeight: '5%'
                            }}
                        >
                            <Toolbar variant="dense">
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
                    </div>
                </div>
                <TabsElements />
            </div>
        </ThemeProvider>
    );
};
export default LandingPage;
