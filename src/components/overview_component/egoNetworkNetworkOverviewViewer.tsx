import EgoNetworkNetworkOverview from './egoNetworkNetworkOverview.tsx';
import { Paper } from '@mui/material';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore.ts';
import { useRef, useEffect } from 'react';
import { useDimensions } from '../../UtilityFunctions.ts';
import ColorLegend from '../ColorLegend.tsx';
import { Container, Stage } from '@pixi/react';

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
            <Stage options={{ backgroundAlpha: 0, resizeTo: window.window }}>
                <Container x={20} y={20} scale={0.94}>
                    <EgoNetworkNetworkOverview />
                </Container>
            </Stage>
            <svg
                height={200}
                width={475}
                style={{ position: 'absolute', left: 0 }}
            >
                <ColorLegend
                    domain={['In ego-graph subnetwork', 'Radar center']}
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
                    title={
                        'Percent of proteins represented in selected ego-graphs (right)'
                    }
                    render={true}
                />
            </svg>
        </Paper>
    );
}

export default EgoNetworkNetworkOverviewViewer;
