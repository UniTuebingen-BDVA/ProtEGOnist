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
import { calculateTextWidth, splitString, svgFontSize } from '../../UtilityFunctions.ts';

function EgoNetworkNetworkOverviewViewer() {
    const ref = useRef(null);

    const [svgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const [coverage] = useAtom(egoNetworkNetworkOverviewCoverageAtom);
    const [egoNetworkNetworkOverviewData] = useAtom(
        getEgoNetworkNetworkOverviewAtom
    );
    const gapBetweenLegends = 10;
    const firstLegendTitle =
        'Percent of nodes represented in ego-graph subnetwork (right)';
    const secondLegendDomain = 'In ego-graph subnetwork';
    const firstLegendTitleSplit = splitString(firstLegendTitle);
    const heightFirstLegendTitle = firstLegendTitleSplit.length * svgFontSize*1.5;
    const widthFirstLegendBody=4*svgFontSize;
    const xTranslateSecondLegend =
        calculateTextWidth(firstLegendTitleSplit) + gapBetweenLegends;
    const xTranslateThirdLegend =
        xTranslateSecondLegend +
        calculateTextWidth([secondLegendDomain]) +
        svgFontSize +
        gapBetweenLegends;

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
                <Grid xs={12} sx={{ top: '11%', position: 'absolute' }}>
                    <svg
                        width={'100%'}
                        height={'100%'}
                        preserveAspectRatio={'xMinYMin'}
                        viewBox={`0 0 ${svgSize.width + widthFirstLegendBody} ${
                            svgSize.height + heightFirstLegendTitle
                        }`}
                    >
                        <ColorLegend
                            domain={[0, 100]}
                            range={['white', '#464646']}
                            type={'quantitative'}
                            transform={`translate(${6},${svgFontSize / 2})`}
                            titleParts={firstLegendTitleSplit}
                            render={true}
                            fontSize={svgFontSize}
                        />
                        <ColorLegend
                            domain={[secondLegendDomain]}
                            range={['#ff7f00']}
                            type={'qualitative'}
                            transform={`translate(${xTranslateSecondLegend},${svgFontSize / 2})`}
                            titleParts={[]}
                            render={true}
                            fontSize={svgFontSize}
                        />
                        <ColorLegend
                            domain={['Radar center']}
                            range={['#ffff99']}
                            type={'qualitative'}
                            transform={`translate(${xTranslateThirdLegend},${svgFontSize / 2})`}
                            titleParts={[]}
                            render={true}
                            fontSize={svgFontSize}
                        />
                        <g transform={`translate(${widthFirstLegendBody},${heightFirstLegendTitle})`}>
                            <EgoNetworkNetworkOverview />
                        </g>
                    </svg>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default EgoNetworkNetworkOverviewViewer;
