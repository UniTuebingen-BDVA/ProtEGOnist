import { useRef, useEffect } from 'react';
import { intersectionDatum } from '../../egoGraphSchema';
import RadarChart from './radarChart.tsx';
import { useAtom } from 'jotai';
import { radarSVGSizeAtom } from './radarStore.ts';
import { useDimensions } from '../../UtilityFunctions.ts';
import { Paper } from '@mui/material';

interface RadarChartViewerProps {
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
}

function RadarChartViewer(props: RadarChartViewerProps) {
    const ref = useRef(null);
    const { width, height } = useDimensions(ref);
    const [svgSize, setSVGSize] = useAtom(radarSVGSizeAtom);
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
                justifyContent: 'center'
            }}
        >
            <svg
                width={'70%'}
                height={'70%'}
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
