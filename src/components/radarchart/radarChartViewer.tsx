import { useRef, useEffect } from 'react';
import { intersectionDatum } from '../../egoGraphSchema';
import RadarChart from './radarChart.tsx';
import { useAtom } from 'jotai';
import { radarSVGSizeAtom } from './radarStore.ts';
import { useDimensions } from '../../UtilityFunctions.ts';
import {
    Backdrop,
    CircularProgress,
    IconButton,
    Paper,
    Tooltip
} from '@mui/material';
import { radarChartBusyAtom } from '../../apiCalls.ts';
import { InformationVariantCircle } from 'mdi-material-ui';
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
    // useEffect(() => {
    //     setSVGSize({ width: width, height: height });
    // }, [height, width]);
    const svgSize = { width: 500, height: 500 };

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                // display: 'flex',
                // textAlign: 'center',
                // //alignItems: 'center',
                // justifyContent: 'center',
                position: 'relative'
            }}
        >
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    position: 'absolute'
                }}
                open={radarBusy}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <IconButton
                style={{ right: 10, position: 'absolute', top: 15 }}
                onClick={() => {
                    setInfoTitle('radarChart');
                    setInfoContent('radarChart');
                }}
            >
                <Tooltip title="Information about the Radar Chart">
                    <InformationVariantCircle />
                </Tooltip>
            </IconButton>
            <svg
                width={'100%'}
                height={'100%'}
                viewBox={`0 0 ${svgSize.width} ${svgSize.width}`}
            >
                <g
                    transform={
                        'translate(' +
                        String(svgSize.width / 2) +
                        ',' +
                        String(svgSize.width / 2) +
                        ')'
                    }
                >
                    <RadarChart
                        intersectionData={props.intersectionData}
                        tarNode={props.tarNode}
                        baseRadius={svgSize.width / 2}
                    />
                </g>
            </svg>
        </Paper>
    );
}

export default RadarChartViewer;
