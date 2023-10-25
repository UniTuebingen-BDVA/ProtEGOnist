import { useGesture } from '@use-gesture/react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import {
    Backdrop,
    CircularProgress,
    Paper,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
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
import { egoNetworkNetworkBusyAtom } from '../../apiCalls.ts';
import { SetCenter, SetAll, SetLeftRight } from 'mdi-material-ui';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import Icon from '@mui/material/Icon';

function EgoNetworkNetworkViewer() {
    const [egoNetworkNetworkBusy] = useAtom(egoNetworkNetworkBusyAtom);
    const [decollapseMode, setDecollapseModeAtom] = useAtom(decollapseModeAtom);
    const svgSize = useAtomValue(egoNetworkNetworkSizeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const [decollapseIDsArray] = useAtom(decollapseIDsArrayAtom);
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
                style={{ left: 5, position: 'absolute', top: 260 }}
                orientation="vertical"
                value={decollapseMode}
                exclusive
                onChange={(_event, nextVal: string) =>
                    setDecollapseModeAtom(nextVal)
                }
            >
                <ToggleButton value="shared" aria-label="list">
                    <SetCenter />
                </ToggleButton>
                <ToggleButton value="all" aria-label="module">
                    <SetAll />
                </ToggleButton>
                <ToggleButton value="unique" aria-label="quilt">
                    <SetLeftRight />
                </ToggleButton>
            </ToggleButtonGroup>
            <svg
                height={250}
                width={200}
                style={{ left: 0, position: 'absolute' }}
            >
                <ColorLegend
                    domain={colorscale.domain()}
                    range={colorscale.range()}
                    type={'quantitative'}
                    transform={`translate(${10},${10})`}
                    title={'#Drugs associated with protein'}
                    render={true}
                />
                <ColorLegend
                    domain={['few interactions', 'many interactions']}
                    range={['#e9cfd7', '#860028']}
                    type={'quantitative'}
                    transform={`translate(${10},${135})`}
                    title={'Node connectivity within ego-graph'}
                    render={renderSecondLegend}
                />
            </svg>
        </Paper>
    );
}

export default EgoNetworkNetworkViewer;
