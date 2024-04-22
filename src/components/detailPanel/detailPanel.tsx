import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { getRadarAtom } from '../../apiCalls';
import { useAtom } from 'jotai';
import { tarNodeAtom } from './radarchart/radarStore';
import RadarChartViewer from './radarchart/radarChartViewer';
import RadarIcon from '@mui/icons-material/Radar';
import HubIcon from '@mui/icons-material/Hub';
import { Paper, styled } from '@mui/material';
import { minHeight, minWidth } from '@mui/system';


interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`detailPanel-tabpanel-${index}`}
      aria-labelledby={`detailPanel-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `detailPanel-tab-${index}`,
    'aria-controls': `detailPanel-tabpanel-${index}`,
  };
}

const StyledTabs = styled(Tabs)(({ theme }) => ({
  margin: theme.spacing(0, 1),
}));


const StyledTab = styled(Tab)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  minWidth: 50,
  maxWidth: 50,
  color: "#000",
}));

export default function DetailPanel() {
  const [value, setValue] = React.useState(0);
  const [intersectionData, getRadarData] = useAtom(getRadarAtom);
  const [tarNode, setTarNode] = useAtom(tarNodeAtom);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
      <Paper sx={{ flexGrow: 1, bgcolor: 'background.paper', display: 'flex',
            width: '100%',
            height: '100%',
         }}>
        <StyledTabs value={value} onChange={handleChange} aria-label="Details Panel" orientation='vertical' 
  sx={{ borderRight: 1, borderColor: 'divider' }}
>
          <StyledTab label={<RadarIcon fontSize="large"/>} {...a11yProps(0)} />
          <StyledTab label={<HubIcon fontSize="large"/>} {...a11yProps(1)} />
        </StyledTabs>
      <TabPanel value={value} index={0}>
        <RadarChartViewer
            intersectionData={intersectionData}
            tarNode={tarNode}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        Item Two
      </TabPanel>
    </Paper>
  );
}