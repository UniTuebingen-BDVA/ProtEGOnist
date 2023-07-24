import { intersectionDatum } from '../../egoGraphSchema';
import { useAtom } from 'jotai';
import * as d3 from 'd3';
import { tarNodeAtom } from './radarStore';
import { getRadarAtom } from '../../apiCalls';
import { Tooltip } from '@mui/material';

interface RadarChartProps {
    baseRadius: number;
}

const RadarChart = (props: RadarChartProps) => {
    const { baseRadius } = props;
    const [intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [tarNode] = useAtom(tarNodeAtom);
    const GUIDE_CIRCLE_RADIUS = baseRadius;
    const GUIDE_CIRCLE_STEP = baseRadius / 4;
    const GUIDE_CIRCLE_RADIUS_MIN = baseRadius / 4;
    const TEXT_RADIUS = baseRadius + 20;
    const CIRCLE_RADIUS = baseRadius / 20;
    const LEGEND_ANGLE = 0 * (Math.PI / 180);
    const intersectionDataClone = structuredClone(intersectionData);
    //generate a linear scale for the size of the intersection property in each intersectionDatum
    const intersectionLengthScale = d3
        .scaleLinear()
        .domain([
            d3.min(Object.values(intersectionDataClone), (d) => d.setSize),
            d3.max(Object.values(intersectionDataClone), (d) => d.setSize)
        ] as [number, number])
        .range([0, 1]);

    // remove tarNode from the intersectionData and store it in tarNodeData
    const tarNodeData: intersectionDatum = structuredClone(
        intersectionDataClone[tarNode]
    );
    delete intersectionDataClone[tarNode];
    // sort the itersectionData by the "classification" property
    const sortedIntersectionData = Object.entries(intersectionDataClone).sort(
        (a, b) => {
            if (a[1].classification < b[1].classification) {
                return -1;
            }
            if (a[1].classification > b[1].classification) {
                return 1;
            }
            return 0;
        }
    );
    // create a color scale that maps the "classification" property to a color
    const colorScale = d3
        .scaleOrdinal()
        .domain(sortedIntersectionData.map((d) => d[1].classification))
        .range(d3.schemeCategory10);

    // calculate the propotion of each classification in the data such that we can use it to calulate the size of the pie chart segments used to indicate the classification of the intersectionDatum.
    const classificationProportions = sortedIntersectionData.reduce(
        (acc, [key, intersectionDatum]) => {
            if (acc[intersectionDatum.classification]) {
                acc[intersectionDatum.classification] += 1;
            } else {
                acc[intersectionDatum.classification] = 1;
            }
            return acc;
        },
        {} as { [name: string]: number }
    );
    // calculate the angle of each pie chart segment
    const angles = Object.entries(classificationProportions).map(
        ([key, value]) => {
            return {
                classification: key,
                angle: (value / sortedIntersectionData.length) * 2 * Math.PI
            };
        }
    );
    // calculate the start and end angle of each pie chart segment
    const pieChartSegments = angles.reduce(
        (acc, { classification, angle }) => {
            const startAngle =
                acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
            const endAngle = startAngle + angle;
            acc.push({
                classification,
                startAngle,
                endAngle
            });
            return acc;
        },
        [] as { classification: string; startAngle: number; endAngle: number }[]
    );

    // draw a circle svg for each intersectionDatum with a radius of the setSize.
    // place the node with tarNode as the center of the svg.
    // position each of remaining in a circle around the center of the svg such that we only have a single revolution but also allow for some space between the circles.
    // circles with a higher jaccard index value are drawn closer to the center of the svg. with the minimum radius being 10 and the maximum radius being 200.
    // also add a circular grid to the svg to make it easier to see the distance between the circles.
    // add a single spoke with labels acting as a radial axis to indicate the jaccard index value of the circular grid.
    // draw a pie chart segment for each classification in the data in a lighter shader of the corresponding color to indicate the classification of the intersectionDatum.
    // add labels to the pie chart segments to indicate the classification of the intersectionDatum, if the label starts on the bottom half of the circle flip the lable so that the lable is more easily readable.
    return (
        <g>
            <path
                id={`textPath-Clockwise`}
                d={`M 0 ${-TEXT_RADIUS} 
        A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 0 1 0 ${TEXT_RADIUS}
        A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 0 1 0 ${-TEXT_RADIUS}`}
                fill="none"
            />
            <path
                id={`textPath-Counterclockwise`}
                d={`M 0 ${-TEXT_RADIUS} 
        A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 0 0 1 ${TEXT_RADIUS}
        A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 0 0 1 ${-TEXT_RADIUS}`}
                fill="none"
            />
            {pieChartSegments.map(
                ({ classification, startAngle, endAngle }) => {
                    const midAngle = (startAngle + endAngle) / 2;
                    const flipLabel = midAngle > 0 && midAngle < Math.PI;
                    const offsetParam =
                        (midAngle * TEXT_RADIUS + (Math.PI / 2) * TEXT_RADIUS) %
                        (2 * Math.PI * TEXT_RADIUS); //TODO Why do i need to calc the modulo and add the 1/2 pi?
                    const startOffset = flipLabel
                        ? Math.PI * 2 * TEXT_RADIUS - offsetParam
                        : offsetParam;
                    return (
                        <g key={classification}>
                            <path
                                d={`M 0 0 L ${
                                    Math.cos(startAngle) * GUIDE_CIRCLE_RADIUS
                                } ${
                                    Math.sin(startAngle) * GUIDE_CIRCLE_RADIUS
                                } A ${GUIDE_CIRCLE_RADIUS} ${GUIDE_CIRCLE_RADIUS} 0 ${
                                    endAngle - startAngle > Math.PI ? 1 : 0
                                } 1 ${
                                    Math.cos(endAngle) * GUIDE_CIRCLE_RADIUS
                                } ${
                                    Math.sin(endAngle) * GUIDE_CIRCLE_RADIUS
                                } Z`}
                                fill={colorScale(classification)}
                                opacity={0.1}
                            />
                            <text
                                fill={colorScale(classification)}
                                fontSize="18px"
                                dominantBaseline="middle"
                            >
                                <textPath
                                    xlinkHref={`#textPath-${
                                        flipLabel
                                            ? 'Counterclockwise'
                                            : 'Clockwise'
                                    }`}
                                    startOffset={startOffset}
                                >
                                    {classification}
                                </textPath>
                            </text>
                        </g>
                    );
                }
            )}
            <line
                x1={0}
                y1={0}
                x2={Math.cos(LEGEND_ANGLE) * GUIDE_CIRCLE_RADIUS}
                y2={Math.sin(LEGEND_ANGLE) * GUIDE_CIRCLE_RADIUS}
                stroke="black"
                opacity={0.1}
            />
            {
                // draw a circle with increasing radius to indicate the distance from the center of the svg.
                // the radii lie between CIRCLE_RADIUS_MIN and CIRCLE_RADIUS and are spaced CIRCLE_RADIUS_STEP apart.
                Array.from(
                    {
                        length: Math.floor(
                            GUIDE_CIRCLE_RADIUS / GUIDE_CIRCLE_STEP
                        )
                    },
                    (_, index) => {
                        const radius =
                            GUIDE_CIRCLE_RADIUS_MIN + GUIDE_CIRCLE_STEP * index;
                        const x = Math.cos(LEGEND_ANGLE) * radius;
                        const y = Math.sin(LEGEND_ANGLE) * radius;
                        return (
                            <g key={radius}>
                                <circle
                                    cx={0}
                                    cy={0}
                                    r={radius}
                                    fill="none"
                                    stroke="black"
                                    opacity={0.1}
                                />
                                <text
                                    x={x}
                                    y={y}
                                    dx="1em"
                                    textAnchor="middle"
                                    fontSize="12px"
                                    opacity={0.5}
                                >
                                    {1 - radius / GUIDE_CIRCLE_RADIUS}
                                </text>
                            </g>
                        );
                    }
                )
            }

            {sortedIntersectionData.map(([key, intersectionDatum], index) => {
                //console.log(intersectionLengthScale(intersectionDatum.setSize));
                return (
                    <Tooltip title={key} key={key}>
                        <circle
                            key={key}
                            cx={
                                Math.cos(
                                    ((index + 0.5) * 2 * Math.PI) /
                                        sortedIntersectionData.length
                                ) *
                                (GUIDE_CIRCLE_RADIUS -
                                    intersectionDatum.jaccard *
                                        GUIDE_CIRCLE_RADIUS)
                            }
                            cy={
                                Math.sin(
                                    ((index + 0.5) * 2 * Math.PI) /
                                        sortedIntersectionData.length
                                ) *
                                (GUIDE_CIRCLE_RADIUS -
                                    intersectionDatum.jaccard *
                                        GUIDE_CIRCLE_RADIUS)
                            }
                            r={
                                CIRCLE_RADIUS +
                                intersectionLengthScale(
                                    intersectionDatum.setSize
                                ) *
                                    CIRCLE_RADIUS
                            }
                            fill={colorScale(intersectionDatum.classification)}
                            fillOpacity={0.7}
                            stroke={colorScale(
                                intersectionDatum.classification
                            )}
                            style={{ transition: 'all 0.5s ease-in-out' }}
                            strokeOpacity={0.8}
                            strokeWidth={1}
                            onClick={() => {
                                getRadarData(key);
                            }}
                        />
                    </Tooltip>
                );
            })}
            <Tooltip title={tarNode} key={tarNode}>
                <circle
                    cx={0}
                    cy={0}
                    r={
                        CIRCLE_RADIUS +
                        intersectionLengthScale(tarNodeData.setSize) *
                            CIRCLE_RADIUS
                    }
                    fill={'red'}
                />
            </Tooltip>
        </g>
    );
};

export default RadarChart;
