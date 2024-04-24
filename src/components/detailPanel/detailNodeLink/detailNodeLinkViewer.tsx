import { useAtom, useSetAtom } from 'jotai';
import DetailView from '../detailView.tsx';
import DetailNodeLink from './detailNodeLink.tsx';
import { getNodeLinkFromSelectionAtom } from '../../../apiCalls.ts';
import React from 'react';
import { animated, useSpring } from '@react-spring/web';
import { useGesture } from '@use-gesture/react';
import Grid from '@mui/system/Unstable_Grid';
import { ButtonGroup, IconButton,Tooltip } from '@mui/material';
import { FitToPageOutline, MagnifyMinusOutline, MagnifyPlusOutline, Network } from 'mdi-material-ui';

interface DetailNodeLinkViewerProps {
}

function DetailNodeLinkViewer(props: DetailNodeLinkViewerProps) {
  const detailBusy = false //useAtom(detailNodeLinkBusyAtom);
  const getNodeLink = useSetAtom(getNodeLinkFromSelectionAtom)
  const svgSize = { width: 500, height: 290};
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
          document.querySelector('#zoomableGroupNodeLink');
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


  const nodeLink =()=>(
    <svg
      ref={ref}
      width={'100%'}
      viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
    >
      <animated.g
        ref={ref}
        id="zoomableGroupNodeLink"
        style={style}
      >
        <DetailNodeLink transform={`translate(${svgSize.width / 2}, ${svgSize.height / 2})`} />
      </animated.g>
    </svg>
  )
  const titleBarContent = () => (
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
          <Tooltip title="DetailNodeLinkViewer">
              <IconButton
                  onClick={() => {
                    getNodeLink()

                  }}
              >
                  <Network />
              </IconButton>
          </Tooltip>
      </ButtonGroup>
  )
  return (
    <div>
        <DetailView
                content={nodeLink}
                title={`Node Link View of selected Nodes`}
                name='Detail Node-Link Diagram'
                infoContent={'detailNodeLink'}
                busy={detailBusy}
                titleBarContent={titleBarContent}
                titleBarContentCols={5}
            />
    </div>
  );
}

export default DetailNodeLinkViewer;