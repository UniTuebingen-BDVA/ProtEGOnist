import React from 'react';
import { useAtom } from 'jotai';

import { Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import { showedTabAtom } from './tabViewerStore.ts';
import { getTableAtom } from '../../apiCalls.ts';
import SelectionTable from '../selectionTable/selectionTable.tsx';
import { getEgographAtom, getRadarAtom } from '../../apiCalls.ts';

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
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
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
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [egoGraph, getEgograph] = useAtom(getEgographAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const handleChange = (e: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Paper
            style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white'
            }}
        >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="basic tabs example"
                >
                    <Tab label="Selection" {...a11yProps(0)} />
                    <Tab label="Examples" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                <SelectionTable
                    onRowSelectionModelChange={(newSelection) => {
                        console.log('SELECTED: ', newSelection);
                        // get the ID from the selection
                        const selectedID = newSelection[0];
                        // get the name from the tableData
                        const selectedName =
                            tableData.rows[selectedID]['UniprotID_inString'];
                        getEgograph(selectedName);
                        getRadarData(selectedName);
                    }}
                />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                HERE IS THE SPACE FOR THE EXAMPLES
            </CustomTabPanel>
        </Paper>
    );
}
export default TabViewer;
