import { animated } from '@react-spring/web';
import { intersectionDatum } from '../../../egoGraphSchema';
import { getRadarAtom } from '../../../apiCalls';
import { useAtom, useAtomValue } from 'jotai';
import * as d3 from 'd3';
import { selectedProteinsAtom } from '../../selectionTable/tableStore';
import { lastSelectedNodeAtom } from './radarStore';
import { memo } from 'react';
import { contextMenuAtom } from '../../utilityComponents/contextMenuStore';
import { hoverAtom, hoverColor } from '../../utilityComponents/hoverStore';

interface RadarCircleProps {
    id: string;
    index: number;
    intersectionDatum: intersectionDatum;
    arrayLength: number;
    GUIDE_CIRCLE_RADIUS: number;
    CIRCLE_RADIUS: number;
    colorScale: d3.ScaleOrdinal<string, unknown, never>;
    intersectionLengthScale: d3.ScaleLinear<number, number, never>;
    styleParam: { [key: string]: number | string | undefined | null | boolean };
}

const RadarCircle = memo(function RadarCircle(props: RadarCircleProps) {
    const {
        id,
        // index,
        intersectionDatum,
        // arrayLength,
        // GUIDE_CIRCLE_RADIUS,
        CIRCLE_RADIUS,
        colorScale,
        intersectionLengthScale,
        styleParam
    } = props;
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const selectedProteins = useAtomValue(selectedProteinsAtom);
    const [lastSelectedNode] = useAtom(lastSelectedNodeAtom);
    const [_contextMenu, setContextMenu] = useAtom(contextMenuAtom);
    const [hoveredNode, setHoveredNode] = useAtom(hoverAtom);

    const color = String(colorScale(intersectionDatum.classification));
    const strokeColor = (id: string) => {
        if (hoveredNode === id) {
            return hoverColor;
        } else if (selectedProteins.includes(id)) {
            return 'orange';
        } else if (id == lastSelectedNode) {
            ('Blue');
        } else {
            color;
        }
    };
    const strokeWidth =
        selectedProteins.includes(id) || id == lastSelectedNode ? 3 : 1;
    const strokeOpacity =
        selectedProteins.includes(id) || id == lastSelectedNode ? 1 : 0.8;

    return (
        <animated.circle
            onContextMenu={(event) => {
                setContextMenu(event, id, 'radar');
            }}
            style={{ pointerEvents: 'all', cursor: 'context-menu' }}
            key={id}
            r={
                CIRCLE_RADIUS +
                intersectionLengthScale(intersectionDatum.setSize) *
                    CIRCLE_RADIUS
            }
            fill={color}
            fillOpacity={0.7}
            // FIXME Type not fully correct
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts2304
            cx={styleParam.cx}
            // FIXME Type not fully correct
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore ts2304
            cy={styleParam.cy}
            stroke={strokeColor(id)}
            style={{ ...styleParam }}
            strokeOpacity={strokeOpacity}
            strokeWidth={strokeWidth}
            onClick={(_event) => {
                getRadarData(id);
            }}
            onMouseEnter={() => {
                setHoveredNode(id);
            }}
            onMouseLeave={() => {
                setHoveredNode('');
            }}
        >
            <title>{id}</title>
        </animated.circle>
    );
});

export default RadarCircle;
