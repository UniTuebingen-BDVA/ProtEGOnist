import { useEffect } from 'react';
import './App.css';
import Egograph from './components/egograph/egograph.tsx';
import { useAtom } from 'jotai';
import {
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import { Grid, Typography } from '@mui/material';
import TabViewer from './components/TabViewer/TabViewer.tsx';
import { AppBar, Toolbar } from '@mui/material';
import RadarChartViewer from './components/radarchart/radarChartViewer.tsx';
import EgoGraphViewer from './components/egograph/egographViewer.tsx';
import SelectionTable from './components/selectionTable/selectionTable';
import { getEgographAtom, getRadarAtom } from './apiCalls.ts';
import { tarNodeAtom } from './components/radarchart/radarStore.ts';
import { getTableAtom } from './apiCalls.ts';

function App() {
    const [innerRadius] = useAtom(innerRadiusAtom);
    const [outerRadius] = useAtom(outerRadiusAtom);
    const [tableData, getTableData] = useAtom(getTableAtom);
    const [egoGraph, getEgograph] = useAtom(getEgographAtom);
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [tarNode, setTarNode] = useAtom(tarNodeAtom);
    useEffect(() => {
        getTableData();
        getEgograph('Q9Y625');
        setTarNode('Q9Y625');
        getRadarData('Q9Y625');
    }, [
        innerRadius,
        outerRadius,
        getEgograph,
        getTableData,
        getRadarData,
        setTarNode
    ]);
    if (
        // check if all data is loaded (not empty)
        tableData.rows.length > 0 && // tableData
        egoGraph.nodes.length > 0 && // egograph
        Object.keys(intersectionData).length > 0 && // radarData
        tarNode !== ''
    ) {
        return (
            <>

<div className="container">
    {/* <!-- First Row --> */}
    <div className="row">
      <div style={{ flex: 1, display:"flex", justifyContent: "center", alignItems: "center"}}>
        {/* <!-- Content for the first row --> */}
        <AppBar
                    className="header-title"
                    style={{ display: 'flex', height: '5%' }}
                >
                    <Toolbar variant="dense">
                        <Typography
                            variant="h6"
                            color="inherit"
                            component="div"
                        >
                            ProtEGOnist
                        </Typography>
                    </Toolbar>
                </AppBar>
      </div>
    </div>

    {/* <!-- Second Row --> */}
    <div className="row">
      {/* <!-- First Column --> */}
      <div className="column" style={{flex:1, minHeight: "100%",height: "100%", width: "33%", minWidth: "33%"}}>
        <div>
          {/* <!-- Content for the first column, first row --> */}
          <TabViewer />

        </div>
        <div>
          {/* <!-- Content for the first column, second row --> */}
          <RadarChartViewer
            intersectionData={intersectionData}
            tarNode={tarNode}
        />
        </div>
      </div>

      {/* <!-- Second Column --> */}
      <div className="column" style={{flex:2, width: "67%"}}>
        <div>
          {/* <!-- Content for the second column, first row --> */}
          <EgoGraphViewer />
        </div>
        
      </div>
    </div>
  </div>

                
             
            </>
        );
    } else return null;
}

export default App;
