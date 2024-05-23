import { intersectionDatum } from '../../../egoGraphSchema';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import * as d3 from 'd3';
import { labelsAtoms, tarNodeAtom } from './radarStore';
import { getRadarAtom, nameNodesByAtom } from '../../../apiCalls';
import RadarCircles from './radarCircles';
import RadarLabel from './radarLabel';
import {
    selectedProteinsAtom,
    tableAtom
} from '../../selectionTable/tableStore';
import { hoverAtom } from '../../utilityComponents/hoverStore';
import { svgFontSizeAtom } from '../../../uiStore.tsx';
import { calculateTextWidth } from '../../../UtilityFunctions.ts';

interface RadarChartProps {
    baseRadius: number;
    intersectionData: { [name: string | number]: intersectionDatum };
    tarNode: string;
    transform: string;
}

const RadarChart = (props: RadarChartProps) => {
    const { baseRadius } = props;
    const tarNode = useAtomValue(tarNodeAtom);
    const intersectionData = useAtomValue(getRadarAtom);
    const setSelectedProteins = useSetAtom(selectedProteinsAtom);
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const [_hoveredNode, setHoveredNode] = useAtom(hoverAtom);
    const [svgFontSize] = useAtom(svgFontSizeAtom);
    const [labels] = useAtom(labelsAtoms);

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

    // calculate the propotion of each classification in the data such that we can use it to calulate the size of the pie chart segments used to indicate the classification of the intersectionDatum.
    const classificationProportions = sortedIntersectionData.reduce(
        (acc, [_key, intersectionDatum]) => {
            if (acc[intersectionDatum.classification]) {
                acc[intersectionDatum.classification] += 1;
            } else {
                acc[intersectionDatum.classification] = 1;
            }
            return acc;
        },
        {} as { [name: string]: number }
    );
    // sort the classiciationProportions by size
    const classificationProportionsSorted = Object.entries(
        classificationProportions
    ).sort((a, b) => {
        return a[1] - b[1];
    });
    // change the order of the classificationProportionsSorted so that the largest is followed by the smallest and so on
    const classificationProportionsalternating: [string, number][] = [];
    for (
        let i = 0;
        i < Math.floor(classificationProportionsSorted.length / 2);
        i++
    ) {
        classificationProportionsalternating.push(
            classificationProportionsSorted[
                classificationProportionsSorted.length - 1 - i
            ]
        );
        classificationProportionsalternating.push(
            classificationProportionsSorted[i]
        );
    }
    if (classificationProportionsSorted.length % 2 !== 0) {
        classificationProportionsalternating.push(
            classificationProportionsSorted[
                Math.floor(classificationProportionsSorted.length / 2)
            ]
        );
    }

    // sort sortedIntersectionData to have the same order as classificationProportionsalternating
    sortedIntersectionData.sort((a, b) => {
        return (
            classificationProportionsalternating.findIndex(
                (d) => d[0] === a[1].classification
            ) -
            classificationProportionsalternating.findIndex(
                (d) => d[0] === b[1].classification
            )
        );
    });
    // create a color scale that maps the "classification" property to a color

    // calculate the angle of each pie chart segment
    const angles = classificationProportionsalternating.map(([key, _size]) => {
        const value = classificationProportions[key];
        return {
            classification: key,
            angle: (value / sortedIntersectionData.length) * 2 * Math.PI
        };
    });
    // calculate the start and end angle of each pie chart segment
    const pieChartSegments = angles.reduce(
        (acc, { classification, angle }) => {
            // limit label length to 15 characters
            const classificationInternal = labels[classification].short;
            const startAngle =
                acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
            const endAngle = startAngle + angle;
            const midAngle = (startAngle + endAngle) / 2;
            // estimate the angular width of the label text at TEXT_RADIUS in radians
            const labelAngleWidth =
                2 *
                Math.PI *
                ((calculateTextWidth([classificationInternal], svgFontSize) *
                    1.2) /
                    (Math.PI * 2 * (baseRadius + svgFontSize))); // 10px per character
            acc.push({
                classification: classificationInternal,
                classificationFull: classification,
                startAngle,
                endAngle,
                midAngle,
                labelAngleWidth,
                ringIndex: -1
            });
            return acc;
        },
        [] as {
            classification: string;
            classificationFull: string;
            startAngle: number;
            endAngle: number;
            midAngle: number;
            labelAngleWidth: number;
            ringIndex: number;
        }[]
    );

    // sort the pieChartSegments by midAngle - labelAngleWidth/2
    pieChartSegments.sort((a, b) => {
        return (
            a.midAngle -
            a.labelAngleWidth / 2 -
            (b.midAngle - b.labelAngleWidth / 2)
        );
    });

    const availableRingIndices: number[] = [0];
    const unavailableRingIndices: number[] = [];
    pieChartSegments.forEach((segment, _index) => {
        // check for all unavailableRingIndices if they are available again
        // this is the case if the current segements midAngle - labelAngleWidth/2 is greater than the midAngle + labelAngleWidth/2 of the segment with the a ringIndex in unavailableRingIndices
        unavailableRingIndices.forEach((ringIndex) => {
            // find all segments with the ringIndex and chooses the one with the largest midAngle
            const segmentWithRingIndex = pieChartSegments.reduce(
                (acc, segment) => {
                    if (segment.ringIndex === ringIndex) {
                        if (!acc) {
                            return segment;
                        }
                        if (segment.midAngle > acc.midAngle) {
                            return segment;
                        }
                    }
                    return acc;
                }
            );
            if (
                segment.midAngle - segment.labelAngleWidth / 2 >
                segmentWithRingIndex.midAngle +
                    segmentWithRingIndex.labelAngleWidth / 2
            ) {
                // remove the ringIndex from unavailableRingIndices and add it to availableRingIndices
                unavailableRingIndices.splice(
                    unavailableRingIndices.indexOf(ringIndex),
                    1
                );
                availableRingIndices.push(ringIndex);
            }
        });

        // if no ring indices are available, add a new one to availableRingIndices
        if (availableRingIndices.length === 0) {
            availableRingIndices.push(unavailableRingIndices.length);
        }
        //pick the first available ringIndex
        const ringIndex = availableRingIndices[0];
        // remove the ringIndex from availableRingIndices and add it to unavailableRingIndices
        availableRingIndices.shift();
        unavailableRingIndices.push(ringIndex);
        // add the ringIndex to the segment
        segment.ringIndex = ringIndex;
    });

    // get max ringIndex
    const maxRingIndex = pieChartSegments.reduce((acc, segment) => {
        if (segment.ringIndex > acc) {
            return segment.ringIndex;
        }
        return acc;
    }, 0);
    const colorsRadar: string[] = [
        '#a6cee3',
        '#33a02c',
        '#fb9a99',
        '#b15928',
        '#6a3d9a',
        '#fdbf6f',
        '#1f78b4',
        '#b2df8a',
        '#e31a1c',
        '#ff7f00',
        '#cab2d6'
    ];
    const colorScale = d3
        .scaleOrdinal<string>()
        .domain(
            Object.values(sortedIntersectionData).map(
                (d) => d[1].classification
            )
        )
        .range(colorsRadar);
    const fontGap = 2;
    const baseRadiusInternal =
        baseRadius - (svgFontSize + fontGap) * (maxRingIndex + 1);
    const GUIDE_CIRCLE_RADIUS = baseRadiusInternal;
    const GUIDE_CIRCLE_STEP = baseRadiusInternal / 4;
    const GUIDE_CIRCLE_RADIUS_MIN = baseRadiusInternal / 4;
    const TEXT_RADIUS = baseRadiusInternal + 10;
    const CIRCLE_RADIUS = baseRadiusInternal / 20;
    const LEGEND_ANGLE = 0 * (Math.PI / 180);
    // FIXME ID is any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore ts2304
    const getNodeName = (id) => {
        // find the rows in the table that match the uniprot ID
        // const filteredRows = tableData.rows.filter((row) => {
        //     return row['nodeID'] === id;
        // });
        const nodeData = tableData.rows[id];

        const nodeNames = String(
            nodeData?.[nameNodesBy] ?? nodeData.nodeID
        ).split(';');
        // generate set of unique protein names
        const uniqueNodeNames = [...new Set(nodeNames)];
        // join the protein names with a comma
        return uniqueNodeNames.join(', ');
    };
    const centerRadius =
        CIRCLE_RADIUS +
        intersectionLengthScale(tarNodeData.setSize) * CIRCLE_RADIUS;
    return (
        <g transform={props.transform}>
            {/* labels and pie segments */}
            {pieChartSegments.map(
                (
                    {
                        classificationFull,
                        startAngle,
                        endAngle,
                        // labelAngleWidth,
                        ringIndex
                    },
                    _index
                ) => {
                    return (
                        <g key={classificationFull}>
                            <RadarLabel
                                hoverLabel={classificationFull}
                                startAngle={startAngle}
                                endAngle={endAngle}
                                radius={
                                    TEXT_RADIUS +
                                    (svgFontSize + fontGap) * ringIndex
                                }
                                guideCircleRadius={GUIDE_CIRCLE_RADIUS}
                                colorScale={colorScale}
                            />
                        </g>
                    );
                }
            )}
            {/* guide circles */}
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
                                    fontSize={svgFontSize}
                                    opacity={0.5}
                                >
                                    {(1 - radius / GUIDE_CIRCLE_RADIUS).toFixed(
                                        2
                                    )}
                                </text>
                            </g>
                        );
                    }
                )
            }

            {
                <RadarCircles
                    intersectionData={sortedIntersectionData}
                    GUIDE_CIRCLE_RADIUS={GUIDE_CIRCLE_RADIUS}
                    CIRCLE_RADIUS={CIRCLE_RADIUS}
                    intersectionLengthScale={intersectionLengthScale}
                    colorScale={colorScale}
                />
            }
            <g>
                <path
                    id={tarNode + '_label'}
                    fill={'none'}
                    stroke="none"
                    d={`
                    M 0 0
                    m 0, ${centerRadius}
                    a ${centerRadius},${centerRadius} 0 1,1,0 -${
                        centerRadius * 2
                    }
                    a ${centerRadius},${centerRadius} 0 1,1,0  ${
                        centerRadius * 2
                    }
                    `}
                />
                <circle
                    cx={0}
                    cy={0}
                    r={centerRadius}
                    stroke={'black'}
                    fill={'#ffff99'}
                    onClick={() => {
                        setSelectedProteins([tarNode]);
                    }}
                    onMouseEnter={() => {
                        setHoveredNode(tarNode);
                    }}
                    onMouseLeave={() => {
                        setHoveredNode('');
                    }}
                />
                <title>{tarNode}</title>
            </g>

            <text
                width={30}
                textAnchor="middle"
                fontSize={svgFontSize}
                fontWeight="bold"
            >
                <textPath
                    startOffset={'50%'}
                    xlinkHref={'#' + tarNode + '_label'}
                >
                    {getNodeName(tarNode)}
                </textPath>
            </text>
        </g>
    );
};

export default RadarChart;
