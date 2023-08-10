import EgoNetworkNetwork from './egoNetworkNetworkOverview.tsx';
import { Paper } from '@mui/material';
import { useAtom } from 'jotai';
import {
    egoNetworkNetworkSizeAtom,
} from './egoNetworkNetworkOverviewStore.ts';

function EgoNetworkNetworkOverviewViewer() {
    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);

    return (
        <Paper
            style={{
                width: '1600px',
                height: '800px',
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
                viewBox={`${svgSize.x} ${svgSize.y} ${svgSize.width} ${svgSize.height}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }}
            >
                <g
                    // transform={
                    //     'translate(' +
                    //     String(svgSize.width / 2) +
                    //     ',' +
                    //     String(svgSize.height / 2) +
                    //     ')'
                    // }
                >
                    <EgoNetworkNetwork />
                </g>
            </svg>
        </Paper>
    );
}
export default EgoNetworkNetworkOverviewViewer;
