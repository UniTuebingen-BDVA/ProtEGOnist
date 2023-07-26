import { useSpring, animated, useChain, useSpringRef } from '@react-spring/web';
import { Tooltip } from '@mui/material';
import { intersectionDatum } from '../../egoGraphSchema';
import { getRadarAtom } from '../../apiCalls';
import { useAtom } from 'jotai';
import * as d3 from 'd3';
import { Opacity } from '@mui/icons-material';

interface RadarCircleProps {
    id: string;
    index: number;
    intersectionDatum: intersectionDatum;
    arrayLength: number;
    GUIDE_CIRCLE_RADIUS: number;
    CIRCLE_RADIUS: number;
    colorScale: d3.ScaleOrdinal<string, unknown, never>;
    intersectionLengthScale: d3.ScaleLinear<number, number, never>;
    isChanged: boolean;
}

const RadarCircle = (props: RadarCircleProps) => {
    const {
        id,
        index,
        intersectionDatum,
        arrayLength,
        GUIDE_CIRCLE_RADIUS,
        CIRCLE_RADIUS,
        colorScale,
        intersectionLengthScale,
        isChanged
    } = props;
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);

    const springToCirclePosition = useSpring({
        from: {
            cx:
                Math.cos(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                GUIDE_CIRCLE_RADIUS *
                1.5,
            cy:
                Math.sin(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                GUIDE_CIRCLE_RADIUS *
                1.5,
            fill: d3
                .color(colorScale(intersectionDatum.classification))
                .brighter(4.0)
                .toString(),
            opacity: 0.0
        },
        to: async (next, cancel) => {
            await next({
                cx:
                    Math.cos(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    GUIDE_CIRCLE_RADIUS,
                cy:
                    Math.sin(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    GUIDE_CIRCLE_RADIUS,
                fill: d3
                    .color(colorScale(intersectionDatum.classification))
                    .brighter(4.0)
                    .toString(),
                opacity: 1.0
            });
            await next({
                cx:
                    Math.cos(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    (GUIDE_CIRCLE_RADIUS -
                        intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                cy:
                    Math.sin(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    (GUIDE_CIRCLE_RADIUS -
                        intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                fill: d3
                    .color(colorScale(intersectionDatum.classification))
                    .brighter(4.0)
                    .toString()
            });
            await next({
                fill: d3
                    .color(colorScale(intersectionDatum.classification))
                    .toString()
            });
        },
        config: { duration: 2000 }
    });

    const springsRemaining = useSpring({
        to: {
            cx:
                Math.cos(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                (GUIDE_CIRCLE_RADIUS -
                    intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
            cy:
                Math.sin(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                (GUIDE_CIRCLE_RADIUS -
                    intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
        },
        config: { duration: 2000 }
    });
    return (
        <Tooltip title={id} key={id}>
            <animated.circle
                key={id}
                cx={
                    Math.cos(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    (GUIDE_CIRCLE_RADIUS -
                        intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
                }
                cy={
                    Math.sin(((index + 0.5) * 2 * Math.PI) / arrayLength) *
                    (GUIDE_CIRCLE_RADIUS -
                        intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
                }
                r={
                    CIRCLE_RADIUS +
                    intersectionLengthScale(intersectionDatum.setSize) *
                        CIRCLE_RADIUS
                }
                fill={colorScale(intersectionDatum.classification)}
                fillOpacity={0.7}
                stroke={colorScale(intersectionDatum.classification)}
                style={
                    isChanged
                        ? { ...springToCirclePosition }
                        : { ...springsRemaining }
                }
                strokeOpacity={0.8}
                strokeWidth={1}
                onClick={() => {
                    getRadarData(id);
                }}
            />
        </Tooltip>
    );
};

export default RadarCircle;
