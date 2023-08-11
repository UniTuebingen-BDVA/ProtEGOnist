import EgoNetworkNetworkOverview from './egoNetworkNetworkOverview.tsx';
import { Paper } from '@mui/material';

import { useAtom } from 'jotai';
import {
    egoNetworkNetworkSizeAtom,
} from './egoNetworkNetworkOverviewStore.ts';
import { useRef, useEffect } from 'react';
import { useDimensions } from '../../UtilityFunctions.ts';

function EgoNetworkNetworkOverviewViewer() {
    const ref = useRef(null);

    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const { width, height } = useDimensions(ref);

    useEffect(() => {
        setSvgSize({ x: 0, y:0 , width: width, height: height });
    }, [height, width]);

    return (
        <Paper
            ref={ref}

            style={{
                width: "100%",
                height: "100%",
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
                viewBox={`${svgSize.x} ${svgSize.y} ${ svgSize.width ?? 0} ${ svgSize.height ?? 0}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }}
            >
                <g>
                    <EgoNetworkNetworkOverview />
                </g>
            </svg>
        </Paper>
    );
}
export default EgoNetworkNetworkOverviewViewer;
