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
import DetailNodeLinkViewer from './detailNodeLink/detailNodeLinkViewer';


/**
 * Props for the TabPanel component.
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Renders a tab panel component.
 *
 * @param {TabPanelProps} props - The props for the TabPanel component.
 * @returns {JSX.Element} The rendered TabPanel component.
 */
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`detailPanel-tabpanel-${index}`}
      aria-labelledby={`detailPanel-tab-${index}`}
      style={{ height: "100%", width: "100%" }}
      {...other}
    >
      {value === index && (
        <Box sx={{ display:'flex'}}>
          {children}
        </Box>
      )}
    </div>
  );
}

/**
 * Returns the accessibility props for a tab.
 *
 * @param index - The index of the tab.
 * @returns The accessibility props for the tab.
 */
function a11yProps(index: number) {
  return {
    id: `detailPanel-tab-${index}`,
    'aria-controls': `detailPanel-tabpanel-${index}`,
  };
}

/**
 * A styled version of the Tabs component.
 */
const StyledTabs = styled(Tabs)(({ theme }) => ({
  margin: theme.spacing(0, 0),
}));


/**
 * Represents a styled tab component.
 *
 * @component
 */
const StyledTab = styled(Tab)(({ theme }) => ({
  margin: theme.spacing(0, 1),
  minWidth: "66px",
  maxWidth: "66px",
  //overflow:"visible",
  color: "#000",
}));

/**
 * DetailPanel component displays a panel with tabs for different details.
 */
export default function DetailPanel() {
  const [value, setValue] = React.useState(0);
  const [intersectionData, getRadarData] = useAtom(getRadarAtom);
  const [tarNode, setTarNode] = useAtom(tarNodeAtom);

  /**
   * Handles the change event when the tab value is changed.
   * @param event - The event object.
   * @param newValue - The new value of the tab.
   */
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper
      sx={{
        flexGrow: 1,
        bgcolor: 'background.paper',
        display: 'flex',
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      <StyledTabs
        value={value}
        onChange={handleChange}
        aria-label="Details Panel"
        orientation="vertical"
        sx={{ borderRight: 1, borderColor: 'divider' }}
      >
        <StyledTab label={<RadarIcon fontSize="large" />} {...a11yProps(0)} />
        <StyledTab label={<HubIcon fontSize="large" />} {...a11yProps(1)} />
      </StyledTabs>
      <TabPanel value={value} index={0}>
        <RadarChartViewer
          intersectionData={intersectionData}
          tarNode={tarNode}
        />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <DetailNodeLinkViewer/>
      </TabPanel>
    </Paper>
  );
}