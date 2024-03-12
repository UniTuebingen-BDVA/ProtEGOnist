import { animated } from '@react-spring/web';
import { intersectionDatum } from '../../egoGraphSchema';
import { getRadarAtom } from '../../apiCalls';
import { useAtom, useAtomValue } from 'jotai';
import * as d3 from 'd3';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import AdvancedTooltip from '../utilityComponents/advancedTooltip';
import { lastSelectedNodeAtom } from './radarStore';
import { memo } from 'react';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore';

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

    const color = String(colorScale(intersectionDatum.classification));
    const strokeColor: string = selectedProteins.includes(id)
        ? 'orange'
        : id == lastSelectedNode
        ? 'red'
        : color;
    const strokeWidth =
        selectedProteins.includes(id) || id == lastSelectedNode ? 3 : 1;
    const strokeOpacity =
        selectedProteins.includes(id) || id == lastSelectedNode ? 1 : 0.8;

    return (
        <AdvancedTooltip nodeID={id} key={id}>
            <animated.circle
                onContextMenu={(event) => {
                    setContextMenu(event, id, 'radar');
                }}
                style={{"pointer-events": "all", "cursor": "context-menu"}}
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
                stroke={strokeColor}
                style={{ ...styleParam }}
                strokeOpacity={strokeOpacity}
                strokeWidth={strokeWidth}
                onClick={(_event) => {
                    getRadarData(id);
                }}
            />
        </AdvancedTooltip>
    );
});

export default RadarCircle;
