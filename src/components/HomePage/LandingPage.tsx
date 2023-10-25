import React, { useCallback, useEffect, useState } from 'react';
import TabsElements from './TabsElements';
import { GitHub, Help, Home } from '@mui/icons-material';
import {
    Toolbar,
    IconButton,
    Button,
    CircularProgress, Container,
    createStyles,
    FormControl,
    FormControlLabel,
    InputLabel, Link,
    List,
    ListItem,
    ListSubheader,
    makeStyles,
    MenuItem,
    Radio,
    RadioGroup,
    Select, Switch, Tab, Tabs,
    TextField,
    Tooltip,
    Box,
    Typography,
    AppBar,
    createTheme,
    ThemeProvider,

} from "@mui/material";
import LogoText from '../../assets/LogoPathWhite.svg';

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
    return (
        <ThemeProvider theme={theme}>

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
                            maxHeight: '5%',
                        }}
                    >
                        {/* <!-- Content for the first row --> */}
                        <AppBar
                            className="header-title"
                            style={{
                                display: 'flex',
                                height: '5%',
                                maxHeight: '5%',
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
                <TabsElements />




            </div>
        </ThemeProvider>
    )
}
export default LandingPage;
