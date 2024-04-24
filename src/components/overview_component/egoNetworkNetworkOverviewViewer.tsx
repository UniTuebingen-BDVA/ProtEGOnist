import EgoNetworkNetworkOverview from './egoNetworkNetworkOverview.tsx';
import { IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore.ts';
import ColorLegend from '../ColorLegend.tsx';
import { InformationVariantCircle } from 'mdi-material-ui';
import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import {
    egoNetworkNetworkOverviewCoverageAtom,
    getEgoNetworkNetworkOverviewAtom
} from '../../apiCalls.ts';
import { useRef } from 'react';

function EgoNetworkNetworkOverviewViewer() {
    const ref = useRef(null);

    const [svgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const [coverage] = useAtom(egoNetworkNetworkOverviewCoverageAtom);
    const [egoNetworkNetworkOverviewData] = useAtom(
        getEgoNetworkNetworkOverviewAtom
    );

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative'
            }}
        >
            <Grid
                container
                spacing={0}
                sx={{
                    top: 10,
                    alignItems: 'flex-start',
                    width: '100%'
                }}
            >
                <Grid xs={11}>
                    <Typography component={'span'} style={{ color: 'black' }}>
                        Network overview:{' '}
                        {egoNetworkNetworkOverviewData.nodes.length} ego-graphs
                        covering {(100 * coverage.nodes).toFixed(2)}% of the
                        nodes and {(100 * coverage.edges).toFixed(2)}% of the
                        edges of the given network.
                    </Typography>
                </Grid>
                <Grid xs={1} xsOffset="auto">
                    <IconButton
                        onClick={() => {
                            setInfoTitle('networkOverview');
                            setInfoContent('networkOverview');
                        }}
                    >
                        <Tooltip title="Information about the Radar Chart">
                            <InformationVariantCircle />
                        </Tooltip>
                    </IconButton>
                </Grid>
                <Grid
                    xs={12}
                    sx={{ top: '10%', position: 'absolute', height: '90%' }}
                >
                    <svg
                        width={'100%'}
                        height={'100%'}
                        viewBox={`0 0 ${svgSize.width + 40} ${
                            svgSize.height + 40
                        }`}
                    >
                        <ColorLegend
                            domain={[0, 100]}
                            range={['white', '#464646']}
                            type={'quantitative'}
                            transform={`translate(${6},${13})`}
                            title={
                                'Percent of nodes represented in ego-graph subnetwork (right)'
                            }
                            render={true}
                        />
                        <g transform={`translate(300,0)`}>
                            {' '}
                            <ColorLegend
                                domain={['In ego-graph subnetwork']}
                                range={['#ff7f00']}
                                type={'qualitative'}
                                transform={`translate(${10},${0})`}
                                title={''}
                                render={true}
                            />
                        </g>
                        <g transform={`translate(450,0)`}>
                            {' '}
                            <ColorLegend
                                domain={['Radar center']}
                                range={['#ffff99']}
                                type={'qualitative'}
                                title={''}
                                render={true}
                            />
                        </g>

                        <g transform={`translate(40,40)`}>
                            <EgoNetworkNetworkOverview />
                        </g>
                    </svg>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default EgoNetworkNetworkOverviewViewer;
