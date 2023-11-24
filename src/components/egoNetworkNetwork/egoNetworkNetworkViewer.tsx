import { useGesture } from '@use-gesture/react';
import EgoNetworkNetwork from './egoNetworkNetwork.tsx';
import {
    Backdrop,
    ButtonGroup,
    CircularProgress,
    IconButton,
    Paper,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import TooltipToggleButton from '../egoNetworkNetwork/TooltipToggleButton.tsx';
import { useAtom } from 'jotai';
import {
    decollapseIDsAtom,
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
import {
    SetCenter,
    SetAll,
    InformationVariantCircle,
    MagnifyPlusOutline,
    MagnifyMinusOutline,
    FitToPageOutline
} from 'mdi-material-ui';
import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';
import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2

function EgoNetworkNetworkViewer() {
    const [egoNetworkNetworkBusy] = useAtom(egoNetworkNetworkBusyAtom);
    const [decollapseMode, setDecollapseModeAtom] = useAtom(decollapseModeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const [decollapseIDsArray] = useAtom(decollapseIDsAtom);
    const [quantifyBy] = useAtom(quantifyNodesByAtom);
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const svgSize = { width: 500, height: 500 };

    // prevent default pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    const [style, api] = useSpring(() => ({
        x: svgSize.width / 2,
        y: svgSize.height / 2,
        scale: 1
    }));
    const ref = React.useRef<SVGSVGElement>(null);
    function zoom(val: number) {
        const target = style.scale.get() + val;
        api.start({ scale: target > 0 ? target : 0 });
    }
    function resetZoomPosition() {
        // when called set the zoom to fit the svg-group zoomableGroup
        // get the svg-group zoomableGroup
        const zoomableGroup: SVGSVGElement =
            document.querySelector('#zoomableGroup');
        // get the bounding box of the svg-group zoomableGroup
        const bbox = zoomableGroup.getBBox();
        // scale the svg-group zoomableGroup to fit the svg either if its width or height is bigger or smaller than the svg
        const scale = Math.min(
            svgSize.width / bbox.width,
            svgSize.height / bbox.height
        );
        // get the center of the svg
        const centerX = svgSize.width / 2;
        const centerY = svgSize.height / 2;
        // get the center of the svg-group zoomableGroup
        const bboxCenterX = bbox.x + bbox.width / 2;
        const bboxCenterY = bbox.y + bbox.height / 2;
        // get the translation of the svg-group zoomableGroup
        const translateX = centerX - bboxCenterX * scale;
        const translateY = centerY - bboxCenterY * scale;

        // set the scale and translate
        api.start({
            x: translateX,
            y: translateY,
            scale: scale
        });
    }
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
                display: 'flex',
                //textAlign: 'center',
                //alignItems: 'center',
                //justifyContent: 'center',
                position: 'relative'
            }}
        >
            <Backdrop
                sx={{
                    color: '#fff',
                    zIndex: (theme) => theme.zIndex.drawer - 1,
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
                width={'100%'}
                height={'100%'}
                ref={ref}
                viewBox={`0 0 ${svgSize.width} ${svgSize.width}`}
                style={{ position: 'absolute' }}
            >
                <animated.g
                    // FIXME Node misses x,y
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore ts2304
                    ref={ref}
                    id="zoomableGroup"
                    style={style}
                >
                    <EgoNetworkNetwork />
                </animated.g>
            </animated.svg>
            <Grid
                container
                spacing={0}
                sx={{
                    top: 10,
                    alignItems: 'flex-start',
                    width: '100%'
                }}
            >
                <Grid xs={2}>
                    <svg height={'100%'} width={'100%'} viewBox="0 0 200 300">
                        <ColorLegend
                            domain={colorscale.domain()}
                            range={colorscale.range()}
                            unknown={colorscale.unknown()}
                            type={'quantitative'}
                            transform={`translate(${10},${10})`}
                            title={`Quantification via ${
                                quantifyBy['label'] != 'default'
                                    ? quantifyBy['label']
                                    : 'density'
                            }`}
                            render={true}
                        />
                        <ColorLegend
                            domain={['few interactions', 'many interactions']}
                            range={['#f6e9ea', '#860028']}
                            type={'quantitative'}
                            transform={`translate(${10},${150})`}
                            title={'Node connectivity within ego-graph'}
                            render={renderSecondLegend}
                        />
                    </svg>
                </Grid>

                <Grid xs={6}>
                    <Typography
                        sx={{
                            color: 'black'
                        }}
                    >
                        Ego-graph subnetwork
                    </Typography>
                </Grid>
                <Grid xs={2}>
                    <ButtonGroup>
                        <IconButton
                            onClick={() => {
                                zoom(0.2);
                            }}
                        >
                            <MagnifyPlusOutline />
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                zoom(-0.2);
                            }}
                        >
                            <MagnifyMinusOutline />
                        </IconButton>
                        <Tooltip title="Fit to view">
                            <IconButton
                                onClick={() => {
                                    resetZoomPosition();
                                }}
                            >
                                <FitToPageOutline />
                            </IconButton>
                        </Tooltip>
                    </ButtonGroup>
                </Grid>

                <Grid xs={1} xsOffset="auto">
                    <ToggleButtonGroup
                        orientation="horizontal"
                        value={decollapseMode}
                        exclusive
                        onChange={(_event, nextVal: string) => {
                            if (nextVal !== null) {
                                setDecollapseModeAtom(nextVal);
                            }
                        }}
                    >
                        <TooltipToggleButton
                            TooltipProps={{
                                title: 'Show ONLY shared nodes on decollapse'
                            }}
                            value="shared"
                            aria-label="shared"
                        >
                            <SetCenter />
                        </TooltipToggleButton>

                        <TooltipToggleButton
                            TooltipProps={{
                                title: 'Show shared AND unique nodes on decollapse'
                            }}
                            value="all"
                            aria-label="all"
                        >
                            <SetAll />
                        </TooltipToggleButton>
                    </ToggleButtonGroup>
                </Grid>
                <Grid xs={1} xsOffset="auto">
                    <Tooltip title="Information about the network">
                        <IconButton
                            onClick={() => {
                                setInfoTitle('egoNetworkNetwork');
                                setInfoContent('egoNetworkNetwork');
                            }}
                        >
                            <InformationVariantCircle />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </Paper>
    );
}

export default EgoNetworkNetworkViewer;
