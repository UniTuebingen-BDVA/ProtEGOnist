import { useEffect, useRef } from 'react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import { Paper } from '@mui/material';
import { useDimensions } from '../../UtilityFunctions.ts';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkStore.ts';

function EgoNetworkNetworkViewer() {
    const refEgoNetworkNetwork = useRef(null);
    const { width, height } = useDimensions(refEgoNetworkNetwork);
    const [svgSize, setSVGSize] = useAtom(egoNetworkNetworkSizeAtom);

    useEffect(() => {
        setSVGSize({ width: width, height: height });
    }, [height, width]);

    return (
        <Paper
            ref={refEgoNetworkNetwork}
            style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 0,
                padding: 0
            }}
        >
            <svg
                width={svgSize.width}
                height={svgSize.height - 10}
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            >
                <g
                    transform={
                        'translate(' +
                        String(svgSize.width / 2) +
                        ',' +
                        String(svgSize.height / 2) +
                        ')'
                    }
                >
                    <EgoNetworkNetwork />
                </g>
            </svg>
        </Paper>
    );
}
export default EgoNetworkNetworkViewer;
