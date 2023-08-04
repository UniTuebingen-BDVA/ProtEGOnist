import { useEffect, useRef } from 'react';
import { useGesture } from '@use-gesture/react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import { Paper } from '@mui/material';
import { useDimensions } from '../../UtilityFunctions.ts';
import { useAtom } from 'jotai';
import {
    egoNetworkNetworkSizeAtom,
    decollapseIDsAtom
} from './egoNetworkNetworkStore.ts';

function EgoNetworkNetworkViewer() {
    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [decollapseIDs, _setDecollapseID] = useAtom(decollapseIDsAtom);

    const bind = useGesture(
        {
            onWheel: ({ event, delta: [, dy] }) => {
                setSvgSize((prevSize) => {
                    const newHeight = prevSize.height + dy;
                    const minHeight = 100;
                    const height =
                        newHeight < minHeight ? minHeight : newHeight;
                    const newWidth =
                        (height / prevSize.height) * prevSize.width;
                    const minWidth = 100;
                    const width = newWidth < minWidth ? minWidth : newWidth;
                    const newX = prevSize.x - (width - prevSize.width) / 2;
                    const minY = 0;
                    const y = prevSize.y < minY ? minY : prevSize.y;
                    return {
                        x: newX,
                        y: y,
                        width: width,
                        height: height
                    };
                });
            },
            onDrag: ({ event, movement: [mx, my] }) => {
                const sensitivity = 0.01;
                setSvgSize((prevSize) => {
                    const newX = prevSize.x - mx * sensitivity;
                    const newY = prevSize.y - my * sensitivity;
                    return {
                        x: newX,
                        y: newY,
                        width: prevSize.width,
                        height: prevSize.height
                    };
                });
            }
        },
        { wheel: { preventDefault: true, preventScroll: true } }
    );

    return (
        <Paper
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
                {...bind()}
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
                    transform={
                        'translate(' +
                        String(svgSize.width / 2) +
                        ',' +
                        String(svgSize.height / 2) +
                        ')'
                    }
                >
                    <EgoNetworkNetwork
                        aggregateEgoNetworkNodeIDs={decollapseIDs}
                    />
                </g>
            </svg>
        </Paper>
    );
}
export default EgoNetworkNetworkViewer;
