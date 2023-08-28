import React from 'react';
import { useAtom } from 'jotai';

import { Box, Paper, Tab, Tabs } from '@mui/material';
import { showedTabAtom } from './tabViewerStore.ts';
import SelectionTable from '../selectionTable/selectionTable.tsx';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
            style={{
                width: '100%',
                height: '100%',
                maxHeight: '100%',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            {value === index && children}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`
    };
}

function TabViewer() {
    const [value, setValue] = useAtom(showedTabAtom);

    const handleChange = (_e: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Paper
            style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white', 
            }}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                >
                    <Tab label="Selection Table*" {...a11yProps(0)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <div style={{ width: '100%', height:"90%",maxHeight: '100%' }}>
                    <SelectionTable />
                </div>
            </CustomTabPanel>
            
        </Paper>
    );
}

export default TabViewer;
