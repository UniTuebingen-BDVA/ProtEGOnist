import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AboutPage from './AboutPage';
import ExamplesPage from './PredefinedExamples';
import { Alert, Link } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import InputFilesForm from './InputFiles';

interface TabPanelProps {
    children?: React.ReactNode;
    dir?: string;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`full-width-tabpanel-${index}`}
            aria-labelledby={`full-width-tab-${index}`}
            {...other}
            style={{
                color: 'black',
                backgroundColor: 'white',
                width: '100%',
                height: '100%'
            }}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography component={'span'}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `full-width-tab-${index}`,
        'aria-controls': `full-width-tabpanel-${index}`
    };
}

export default function TabsElements() {
    const theme = useTheme();
    const [value, setValue] = React.useState(0);

    const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };
    return (
        <Grid xs={12}>
            <Grid xs={12}>
                <AppBar position="static">
                    <Tabs
                        value={value}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        aria-label="full width tabs example"
                        style={{ backgroundColor: 'white' }}
                    >
                        <Tab label="Home" {...a11yProps(0)} />
                        <Tab label="Data Upload" {...a11yProps(1)} />
                        <Tab label="Example Data" {...a11yProps(2)} />
                    </Tabs>
                </AppBar>
            </Grid>

            <Grid xs={12}>
                <TabPanel value={value} index={0} dir={theme.direction}>
                    <AboutPage setTab={setValue} />
                </TabPanel>
                <TabPanel value={value} index={1} dir={theme.direction}>

                    <InputFilesForm />
                </TabPanel>
                <TabPanel value={value} index={2} dir={theme.direction}>
                    <ExamplesPage />
                </TabPanel>
            </Grid>
        </Grid>
    );
}
