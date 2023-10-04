import { useTransition } from '@react-spring/web';
import { intersectionDatum } from '../../egoGraphSchema';
import RadarCircle from './radarCircle';
import * as d3 from 'd3';
import { memo } from 'react';

interface RadarCirclesProps {
    intersectionData: [string, intersectionDatum][];
    GUIDE_CIRCLE_RADIUS: number;
    CIRCLE_RADIUS: number;
    intersectionLengthScale: d3.ScaleLinear<number, number, never>;
    colorScale: d3.ScaleOrdinal<string, any | string, never>;
}

const RadarCircles = memo(function RadarCircles(props: RadarCirclesProps) {
    const {
        intersectionData,
        GUIDE_CIRCLE_RADIUS,
        CIRCLE_RADIUS,
        intersectionLengthScale,
        colorScale
    } = props;
    const intersectionDataWithIndex = intersectionData.map(
        ([key, intersectionDatum], index) => ({
            key,
            intersectionDatum,
            index
        })
    );

    // use transitions to animate the circles
    const transitions = useTransition(intersectionDataWithIndex, {
        keys: ({ key }) => key,
        from: ({ intersectionDatum, index }) => ({
            cx:
                Math.cos(
                    ((index + 0.5) * 2 * Math.PI) / intersectionData.length
                ) *
                GUIDE_CIRCLE_RADIUS *
                1.5,
            cy:
                Math.sin(
                    ((index + 0.5) * 2 * Math.PI) / intersectionData.length
                ) *
                GUIDE_CIRCLE_RADIUS *
                1.5,
            fill: d3
                .color(colorScale(intersectionDatum.classification))
                ?.brighter(4.0)
                .toString(),
            opacity: 0
        }),
        enter:
            ({ intersectionDatum, index }) =>
            async (next, _cancel) => {
                await next({
                    cx:
                        Math.cos(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) * GUIDE_CIRCLE_RADIUS,
                    cy:
                        Math.sin(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) * GUIDE_CIRCLE_RADIUS,
                    fill: d3
                        .color(colorScale(intersectionDatum.classification))
                        ?.brighter(4.0)
                        .toString(),
                    opacity: 1
                });
                await next({
                    cx:
                        Math.cos(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                    cy:
                        Math.sin(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
                });
                await next({
                    fill: d3
                        .color(colorScale(intersectionDatum.classification))
                        ?.toString()
                });
            },
        leave:
            ({ intersectionDatum, index }) =>
            async (next, _cancel) => {
                await next({
                    cx:
                        Math.cos(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                    cy:
                        Math.sin(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
                });
                await next({
                    cx:
                        Math.cos(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        GUIDE_CIRCLE_RADIUS *
                        1.5,
                    cy:
                        Math.sin(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        GUIDE_CIRCLE_RADIUS *
                        1.5,
                    opacity: 0
                });
            },
        update:
            ({ intersectionDatum, index }) =>
            async (next, _cancel) => {
                await next({
                    cx:
                        Math.cos(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                    cy:
                        Math.sin(
                            ((index + 0.5) * 2 * Math.PI) /
                                intersectionData.length
                        ) *
                        (GUIDE_CIRCLE_RADIUS -
                            intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS),
                    fill: d3
                        .color(colorScale(intersectionDatum.classification))
                        ?.toString()
                });
            },
        config: { duration: 1200 }
    });

    return (
        <>
            {transitions((style, transitionData) => (
                <RadarCircle
                    key={transitionData.key}
                    id={transitionData.key}
                    index={transitionData.index}
                    intersectionDatum={transitionData.intersectionDatum}
                    arrayLength={intersectionData.length}
                    GUIDE_CIRCLE_RADIUS={GUIDE_CIRCLE_RADIUS}
                    CIRCLE_RADIUS={CIRCLE_RADIUS}
                    colorScale={colorScale}
                    intersectionLengthScale={intersectionLengthScale}
                    styleParam={style}
                />
            ))}
        </>
    );
});

export default RadarCircles;
