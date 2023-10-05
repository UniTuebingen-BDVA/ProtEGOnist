import { useRef, useEffect } from 'react';
import { intersectionDatum } from '../../egoGraphSchema';
import RadarChart from './radarChart.tsx';
import { useAtom } from 'jotai';
import { radarSVGSizeAtom } from './radarStore.ts';
import { useDimensions } from '../../UtilityFunctions.ts';
import { Backdrop, CircularProgress, Paper } from '@mui/material';
import { radarChartBusyAtom } from '../../apiCalls.ts';

interface RadarChartViewerProps {
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
}

function RadarChartViewer(props: RadarChartViewerProps) {
    const ref = useRef(null);
    const { width, height } = useDimensions(ref);
    const [svgSize, setSVGSize] = useAtom(radarSVGSizeAtom);
    const [radarBusy] = useAtom(radarChartBusyAtom);
    useEffect(() => {
        setSVGSize({ width: width, height: height });
    }, [height, width]);

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                textAlign: 'center',
                alignItems: 'center',
                justifyContent: 'center',
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
            <svg
                width={svgSize.width}
                height={svgSize.height}
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
