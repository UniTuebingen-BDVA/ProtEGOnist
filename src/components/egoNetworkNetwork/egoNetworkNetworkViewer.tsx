import { useGesture } from '@use-gesture/react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import {
    Backdrop,
    CircularProgress,
    Paper,
    ToggleButtonGroup,
    Tooltip
} from '@mui/material';
import TooltipToggleButton from '../egoNetworkNetwork/TooltipToggleButton.tsx';
import { useAtom, useAtomValue } from 'jotai';
import {
    decollapseIDsArrayAtom,
    egoNetworkNetworkSizeAtom,
    decollapseModeAtom
} from './egoNetworkNetworkStore.ts';
import ColorLegend from '../ColorLegend.tsx';
import { drugsPerProteinColorscaleAtom } from '../selectionTable/tableStore.tsx';
import { animated, useSpring } from '@react-spring/web';
import React from 'react';
import {
    egoNetworkNetworkBusyAtom,
    quantifyNodesByAtom
} from '../../apiCalls.ts';
import { SetCenter, SetAll } from 'mdi-material-ui';

function EgoNetworkNetworkViewer() {
    const [egoNetworkNetworkBusy] = useAtom(egoNetworkNetworkBusyAtom);
    const [decollapseMode, setDecollapseModeAtom] = useAtom(decollapseModeAtom);
    const svgSize = useAtomValue(egoNetworkNetworkSizeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const [decollapseIDsArray] = useAtom(decollapseIDsArrayAtom);
    const [quantifyBy] = useAtom(quantifyNodesByAtom);
    // prevent default pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    const [style, api] = useSpring(() => ({
        x: svgSize.width / 2,
        y: svgSize.height / 2,
        scale: 1
    }));
    const ref = React.useRef<HTMLDivElement>(null);

    useGesture(
        {
            onWheel: ({ delta: [, dy] }) => {
                // todo: if we want to have a scrolling webpage: https://stackoverflow.com/questions/57358640/cancel-wheel-event-with-e-preventdefault-in-react-event-bubbling
                const target = style.scale.get() - dy * 0.001;
                api.start({ scale: target > 0 ? target : 0 });
            },
            onDrag: ({ offset: [x, y] }) => {
                api.start({ x, y });
            }
        },
        {
            target: ref,
            drag: {
                from: () => [style.x.get(), style.y.get()],
                eventOptions: { passive: false }
            },
            wheel: {
                preventDefault: true,
                preventScroll: true,
                eventOptions: { passive: false }
            }
        }
    );
    const renderSecondLegend = decollapseIDsArray.length > 0;
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
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    position: 'absolute'
                }}
                open={egoNetworkNetworkBusy}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
            <animated.svg
                // FIXME Node misses x,y
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                ref={ref}
                width="100%"
                height="100%"
            >
                <animated.g
                    // FIXME Node misses x,y
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore ts2304
                    ref={ref}
                    style={style}
                >
                    <EgoNetworkNetwork />
                </animated.g>
            </animated.svg>
            <ToggleButtonGroup
                style={{ left: 5, position: 'absolute', top: 280 }}
                orientation="vertical"
                value={decollapseMode}
                exclusive
                onChange={(_event, nextVal: string) => {
                    if (nextVal !== null) {
                        console.log('butto#', decollapseMode);
                        setDecollapseModeAtom(nextVal);
                    }
                }}
            >
                <TooltipToggleButton
                    TooltipProps={{ title: 'Show ONLY shared nodes' }}
                    value="shared"
                    aria-label="shared"
                >
                    <SetCenter />
                </TooltipToggleButton>

                <TooltipToggleButton
                    TooltipProps={{ title: 'Show shared AND unique nodes' }}
                    value="all"
                    aria-label="all"
                >
                    <SetAll />
                </TooltipToggleButton>
            </ToggleButtonGroup>
            <svg
                height={275}
                width={200}
                style={{ left: 0, position: 'absolute' }}
            >
                <ColorLegend
                    domain={colorscale.domain()}
                    range={colorscale.range()}
                    unknown={colorscale.unknown()}
                    type={'quantitative'}
                    transform={`translate(${10},${10})`}
                    title={`Quantification via ${quantifyBy['label']}`}
                    render={true}
                />
                <ColorLegend
                    domain={['few interactions', 'many interactions']}
                    range={['#e9cfd7', '#860028']}
                    type={'quantitative'}
                    transform={`translate(${10},${150})`}
                    title={'Node connectivity within ego-graph'}
                    render={renderSecondLegend}
                />
            </svg>
        </Paper>
    );
}

export default EgoNetworkNetworkViewer;
