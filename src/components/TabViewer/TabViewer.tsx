import React from 'react';
import { useAtom } from 'jotai';

import { Box,  Tabs, Tab, Typography } from '@mui/material';
import { showedTabAtom } from './tabViewerStore.ts';


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
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

function TabViewer() {
    const [value, setValue] = useAtom(showedTabAtom);
    const handleChange = (e: React.SyntheticEvent, newValue: number) => {
            setValue(newValue);
          };

        return (

        <div style={{ width: '100%', height:'100%', alignItems: "center", justifyContent: "center", backgroundColor:"white" }} >
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Selection" {...a11yProps(0)} />
                    <Tab label="Examples" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabPanel value={value} index={0}>
                HERE IS THE SPACE FOR THE TABLE
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
                HERE IS THE SPACE FOR THE EXAMPLES
            </CustomTabPanel>                      
            </div>
        );
}
export default TabViewer;
