import { useAtom, useSetAtom } from 'jotai';
import DetailView from '../detailView.tsx';
import DetailNodeLink from './detailNodeLink.tsx';
import {
    detailNodeLinkBusyAtom,
    getNodeLinkFromSelectionAtom
} from '../../../apiCalls.ts';
import React, { useCallback, useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import { Autocomplete, IconButton, TextField, Tooltip } from '@mui/material';
import {
    FitToPageOutline,
    MagnifyMinusOutline,
    MagnifyPlusOutline
} from 'mdi-material-ui';
import SyncIcon from '@mui/icons-material/Sync';
import { nodeKeysAtom, selectedNodeAtom } from './detailStore.ts';
import Grid from '@mui/system/Unstable_Grid/Grid';
import { detailedSVGSizeAtom } from '../../../uiStore.tsx';

interface DetailNodeLinkViewerProps {}

/**
 * Renders a detail node-link viewer component.
 *
 * @param props - The props for the DetailNodeLinkViewer component.
 * @returns The rendered DetailNodeLinkViewer component.
 */
function DetailNodeLinkViewer(props: DetailNodeLinkViewerProps) {
    const [detailBusy] = useAtom(detailNodeLinkBusyAtom);
    const getNodeLink = useSetAtom(getNodeLinkFromSelectionAtom);
    const [searchedNode, setSearchedNode] = useAtom(selectedNodeAtom);
    const [getNodeKeys] = useAtom(nodeKeysAtom);
    const [svgSize] = useAtom(detailedSVGSizeAtom);

    // prevent default pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('gesturechange', (e) => e.preventDefault());
    const [style, api] = useSpring(() => ({
        x: 0,
        y: 0,
        scale: 1
    }));
    const ref = React.useRef<SVGSVGElement>(null);
    const groupRef = React.useRef<SVGGElement>(null);

    const zoom = useCallback((val: number) =>{
        const target = style.scale.get() + val;
        void api.start({ scale: target > 0 ? target : 0 });
    },[api,style])

    const resetZoomPosition = useCallback(() => {
        // when called set the zoom to fit the svg-group zoomableGroup
        // get the svg-group zoomableGroup
        if (groupRef.current && ref.current) {
            // get the bounding box of the svg-group zoomableGroup
            const bbox = groupRef.current.getBBox();
            // get the bounding box of the svg-group zoomableGroup
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
            void api.start({
                x: translateX,
                y: translateY,
                scale: scale
            });
        }
    }, [api, svgSize.width,svgSize.height]);
    useEffect(() => {
            resetZoomPosition();
    }, [resetZoomPosition]);
    useGesture(
        {
            onWheel: ({ delta: [, dy] }) => {
                // todo: if we want to have a scrolling webpage: https://stackoverflow.com/questions/57358640/cancel-wheel-event-with-e-preventdefault-in-react-event-bubbling
                const target = style.scale.get() - dy * 0.001;
                void api.start({ scale: target > 0 ? target : 0 });
            },
            onDrag: ({ offset: [x, y] }) => {
                void api.start({ x, y });
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

    const titleBarContent = () => (
        <Grid container>
            <Grid xs={6}>
                <Autocomplete
                    id="nodeSearch"
                    options={getNodeKeys}
                    value={searchedNode}
                    renderInput={(params) => (
                        <TextField {...params} label="nodeSearch" />
                    )}
                    onChange={(_ev, val) => setSearchedNode(val)}
                />
            </Grid>
            <Grid xs={1}>
                <IconButton
                    onClick={() => {
                        zoom(0.2);
                    }}
                >
                    <MagnifyPlusOutline />
                </IconButton>
            </Grid>
            <Grid xs={1}>
                <IconButton
                    onClick={() => {
                        zoom(-0.2);
                    }}
                >
                    <MagnifyMinusOutline />
                </IconButton>
            </Grid>
            <Grid xs={1}>
                <Tooltip title="Fit to view">
                    <IconButton
                        onClick={() => {
                            resetZoomPosition();
                        }}
                    >
                        <FitToPageOutline />
                    </IconButton>
                </Tooltip>
            </Grid>
            <Grid xs={1}>
                <Tooltip title="DetailNodeLinkViewer">
                    <IconButton
                        onClick={() => {
                            getNodeLink();
                        }}
                    >
                        <SyncIcon />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
    );
    return (
        <DetailView
            title={`Node Link View of selected Nodes`}
            name="Detail Node-Link Diagram"
            infoContent={'detailNodeLink'}
            busy={detailBusy}
            titleBarContent={titleBarContent}
            titleBarContentCols={8}
            contentOutsideGrid={true}
        >
            <svg
                ref={ref}
                width={'90%'}
                height={'100%'}
                preserveAspectRatio={'xMinYMin'}
                style={{position:"absolute", left:"10%"}}
                viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
            >
                    <animated.g ref={groupRef} style={style}>
                        <DetailNodeLink/>
                    </animated.g>
            </svg>
        </DetailView>
    );
}

export default DetailNodeLinkViewer;
