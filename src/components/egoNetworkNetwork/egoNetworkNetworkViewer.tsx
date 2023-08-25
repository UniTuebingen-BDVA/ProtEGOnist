import { useGesture } from '@use-gesture/react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import { Paper} from '@mui/material';
import { useAtom } from 'jotai';
import { egoNetworkNetworkSizeAtom } from './egoNetworkNetworkStore.ts';
import { useRef } from 'react';
import ColorLegend from '../ColorLegend.tsx';
import { drugsPerProteinColorscaleAtom } from '../selectionTable/tableStore.tsx';

function EgoNetworkNetworkViewer() {
    const [svgSize, setSvgSize] = useAtom(egoNetworkNetworkSizeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const target = useRef();
    // prevent default pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());

    useGesture(
        {
            onWheel: ({ event, delta: [, dy] }) => {
                // todo: if we want to have a scrolling webpage: https://stackoverflow.com/questions/57358640/cancel-wheel-event-with-e-preventdefault-in-react-event-bubbling
                setSvgSize((prevSize) => {
                    event.preventDefault();
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
                    const newY = prevSize.y < minY ? minY : prevSize.y;
                    return {
                        x: newX,
                        y: newY,
                        width: width,
                        height: height
                    };
                });
            },
            onDrag: ({  movement: [mx, my] }) => {
                const sensitivity = 0.2;
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
        {
            target,
            wheel: {
                preventDefault: true,
                preventScroll: true,
                eventOptions: { passive: false }
            }
        }
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
                ref={target}
                width="100%"
                height="100%"
                viewBox={`${svgSize.x} ${svgSize.y} ${svgSize.width} ${svgSize.height}`}
                style={{
                    touchAction: 'none',
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
                    <EgoNetworkNetwork />
                </g>
            </svg>
            <svg height={450} width={200}>
                <ColorLegend
                    domain={colorscale.domain()}
                    range={colorscale.range()}
                    type={'quantitative'}
                    transform={`translate(${10},${10})`}
                    title={'#Drugs associated with protein'}
                />
                <ColorLegend
                    domain={["few interactions","many interactions"]}
                    range={['#f7f4f9', '#67001f']}
                    type={'quantitative'}
                    transform={`translate(${10},${235})`}
                    title={'Node connectivity within ego-graph'}
                />
            </svg>
        </Paper>
    );
}

export default EgoNetworkNetworkViewer;
