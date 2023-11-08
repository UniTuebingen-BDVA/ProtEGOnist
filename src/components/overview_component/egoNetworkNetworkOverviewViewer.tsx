import EgoNetworkNetworkOverview from './egoNetworkNetworkOverview.tsx';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkOverviewStore.ts';
import { useRef } from 'react';
import ColorLegend from '../ColorLegend.tsx';
import { InformationVariantCircle } from 'mdi-material-ui';
import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';

function EgoNetworkNetworkOverviewViewer() {
    const ref = useRef(null);

    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);

    return (
        <Paper
            ref={ref}
            style={{
                width: '100%',
                height: '95%',
                //display: 'flex',
                // textAlign: 'center',
                // alignItems: 'center',
                // justifyContent: 'center',
                position: 'relative'
            }}
        >
            <svg
                width={'100%'}
                height={'100%'}
                viewBox={`0 0 ${svgSize.width * 1.05} ${svgSize.height * 1.0}`}
            >
                <g
                    transform={`translate(${svgSize.width / 20},${
                        svgSize.height / 20
                    })`}
                >
                    <EgoNetworkNetworkOverview />
                </g>
            </svg>
            <svg
                height={'30%'}
                width={'100%'}
                style={{ left: 0, position: 'absolute' }}
            >
                <ColorLegend
                    domain={['In ego-graph subnetwork', 'Radar center']}
                    range={['#ff7f00', '#ffff99']}
                    type={'qualitative'}
                    transform={`translate(${340},${0})`}
                    title={''}
                    render={true}
                />
                <ColorLegend
                    domain={[0, 100]}
                    range={['white', '#1f78b4']}
                    type={'quantitative'}
                    transform={`translate(${10},${10})`}
                    title={
                        'Percent of nodes represented in ego-graph subnetwork (right)'
                    }
                    render={true}
                />
            </svg>
            <IconButton
                style={{ right: 10, position: 'absolute', top: 15 }}
                onClick={() => {
                    setInfoTitle('networkOverview');
                    setInfoContent('networkOverview');
                }}
            >
                <Tooltip title="Information about the Radar Chart">
                    <InformationVariantCircle />
                </Tooltip>
            </IconButton>
        </Paper>
    );
}

export default EgoNetworkNetworkOverviewViewer;
