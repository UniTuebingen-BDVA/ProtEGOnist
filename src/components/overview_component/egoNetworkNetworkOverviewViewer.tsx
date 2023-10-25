import EgoNetworkNetworkOverview from './egoNetworkNetworkOverview.tsx';
import { Paper } from '@mui/material';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore.ts';
import { useRef, useEffect } from 'react';
import { useDimensions } from '../../UtilityFunctions.ts';
import ColorLegend from '../ColorLegend.tsx';

function EgoNetworkNetworkOverviewViewer() {
    const ref = useRef(null);

    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const { width, height } = useDimensions(ref);

    useEffect(() => {
        setSvgSize({ x: 0, y: 0, width: width, height: height });
    }, [height, width]);

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                padding: 0,
                overflow: 'hidden',
                position: 'relative'
            }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`${svgSize.x} ${svgSize.y} ${svgSize.width + 30 ?? 0} ${svgSize.height + 30 ?? 0
                    }`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }}
            >
                <g transform={"translate(40,35)"}>
                    <EgoNetworkNetworkOverview />
                </g>
            </svg>
            <svg height={200} width={475}>
                <ColorLegend
                    domain={["In ego-graph subnetwork", "Radar center"]}
                    range={['#ff7f00', '#ffff99']}
                    type={'qualitative'}
                    transform={`translate(${340},${-7})`}
                    title={''}
                    render={true}
                />
                <ColorLegend
                    domain={[0, 100]}
                    range={['white', '#1f78b4']}
                    type={'quantitative'}
                    transform={`translate(${10},${5})`}
                    title={'Percent of nodes represented in ego-graph subnetwork (right)'}

                    render={true}
                />

            </svg>
        </Paper>
    );
}

export default EgoNetworkNetworkOverviewViewer;
