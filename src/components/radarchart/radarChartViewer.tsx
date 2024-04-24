import { useRef } from 'react';
import { intersectionDatum } from '../../egoGraphSchema';
import RadarChart from './radarChart.tsx';
import { useAtom } from 'jotai';
import {
    Backdrop,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from '@mui/material';
import { classifyByAtom, radarChartBusyAtom } from '../../apiCalls.ts';
import { InformationVariantCircle } from 'mdi-material-ui';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';
interface RadarChartViewerProps {
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
}

function RadarChartViewer(props: RadarChartViewerProps) {
    const ref = useRef(null);
    //const { width, height } = useDimensions(ref);
    //const [svgSize, setSVGSize] = useAtom(radarSVGSizeAtom);
    const [radarBusy] = useAtom(radarChartBusyAtom);
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const [classifyBy] = useAtom(classifyByAtom);

    // useEffect(() => {
    //     setSVGSize({ width: width, height: height });
    // }, [height, width]);
    const svgSize = { width: 800, height: 350 };

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}
        >
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer - 1,
                    position: 'absolute'
                }}
                open={radarBusy}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <Grid
                container
                spacing={0}
                sx={{
                    top: 10,
                    width: '100%',
                    height: '100%'
                }}
            >
                <Grid xs={11}>
                    <Typography component={'span'} style={{ color: 'black' }}>
                        Neighborhood of selected node (radar center) classified
                        by {classifyBy}
                    </Typography>
                </Grid>
                <Grid xs={1} sx={{ display: 'flex' }}>
                    <IconButton
                        onClick={() => {
                            setInfoTitle('radarChart');
                            setInfoContent('radarChart');
                        }}
                    >
                        <Tooltip title="Information about the Radar Chart">
                            <InformationVariantCircle />
                        </Tooltip>
                    </IconButton>
                </Grid>
                <Grid xs={12}>
                    <svg
                        viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
                    >
                        <g
                            transform={
                                'translate(' +
                                String(svgSize.width / 2) +
                                ',' +
                                String(svgSize.height / 2) +
                                ')'
                            }
                        >
                            <RadarChart
                                intersectionData={props.intersectionData}
                                tarNode={props.tarNode}
                                baseRadius={svgSize.height / 2}
                            />
                        </g>
                    </svg>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default RadarChartViewer;
