import React from 'react';
import { useAtom } from 'jotai';

import { Box, Paper, Tab, Tabs } from '@mui/material';
import { multiSelectionAtom, showedTabAtom } from './tabViewerStore.ts';
import {
    getEgographBundleAtom,
    getRadarAtom,
    getTableAtom
} from '../../apiCalls.ts';
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
    const [tableData, _getTableData] = useAtom(getTableAtom);
    const [_egoGraphBundle, getEgographBundle] = useAtom(getEgographBundleAtom);
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [multiSelection, setMultiSelection] = useAtom(multiSelectionAtom);

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
                <div style={{ width: '100%', maxHeight: '100%' }}>
                    <SelectionTable
                        onRowSelectionModelChange={(newSelection) => {
                            console.log('SELECTED: ', newSelection);
                            // get the ID from the selection
                            const selectedID = newSelection[0];
                            // get the name from the tableData
                            const selectedName =
                                tableData.rows[selectedID][
                                    'UniprotID_inString'
                                ];
                            const multiSelectionLocal = multiSelection.slice();
                            multiSelectionLocal.push(selectedName);
                            if (multiSelectionLocal.length > 3) {
                                multiSelectionLocal.shift();
                            }
                            setMultiSelection(multiSelectionLocal);
                            getEgographBundle(multiSelectionLocal);
                            getRadarData(selectedName);
                        }}
                    />
                </div>
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                HERE IS THE SPACE FOR THE EXAMPLES
            </CustomTabPanel>
        </Paper>
    );
}

export default TabViewer;
