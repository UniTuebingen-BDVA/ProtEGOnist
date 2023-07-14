import { intersectionDatum } from "../../egoGraphSchema";
import * as d3 from "d3";

interface RadarChartProps {
  intersectionData: { [name: string | number]: intersectionDatum };
  tarNode: string;
}

const RadarChart = (props: RadarChartProps) => {
  const { intersectionData, tarNode } = props;
  const GUIDE_CIRCLE_RADIUS = 200;
  const GUIDE_CIRCLE_STEP = 50;
  const GUIDE_CIRCLE_RADIUS_MIN = 50;
  const TEXT_RADIUS = 220;
  const CIRCLE_RADIUS = 15;
  //generate a linear scale for the size of the intersection property in each intersectionDatum
  const intersectionLengthScale = d3
    .scaleLinear()
    .domain([
      d3.min(Object.values(intersectionData), (d) => d.setSize),
      d3.max(Object.values(intersectionData), (d) => d.setSize),
    ] as [number, number])
    .range([0, 1]);

  // extract tarNode from the intersectionData
  const tarNodeData = intersectionData[tarNode];
  // remove tarNode from the intersectionData
  delete intersectionData[tarNode];

  // sort the itersectionData by the "classification" property
  const sortedIntersectionData = Object.entries(intersectionData).sort(
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
        angle: (value / sortedIntersectionData.length) * 2 * Math.PI,
      };
    }
  );
  // calculate the start and end angle of each pie chart segment
  const pieChartSegments = angles.reduce((acc, { classification, angle }) => {
    const startAngle = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const endAngle = startAngle + angle;
    acc.push({
      classification,
      startAngle,
      endAngle,
    });
    return acc;
  }, [] as { classification: string; startAngle: number; endAngle: number }[]);

  // draw a circle svg for each intersectionDatum with a radius of the setSize.
  // place the node with tarNode as the center of the svg.
  // position each of remaining in a circle around the center of the svg such that we only have a single revolution but also allow for some space between the circles.
  // circles with a higher jaccard index value are drawn closer to the center of the svg. with the minimum radius being 10 and the maximum radius being 200.
  // also add a circular grid to the svg to make it easier to see the distance between the circles.
  // draw a pie chart segment for each classification in the data in a lighter shader of the corresponding color to indicate the classification of the intersectionDatum.
  // add labels to the pie chart segments to indicate the classification of the intersectionDatum.
  return (
    <g>
      {pieChartSegments.map(({ classification, startAngle, endAngle }) => {
        const midAngle = (startAngle + endAngle) / 2;
        const textX = Math.cos(midAngle) * TEXT_RADIUS;
        const textY = Math.sin(midAngle) * TEXT_RADIUS;

        return (
          <g key={classification}>
            <path
              d={`M 0 0 L ${Math.cos(startAngle) * GUIDE_CIRCLE_RADIUS} ${
                Math.sin(startAngle) * GUIDE_CIRCLE_RADIUS
              } A ${GUIDE_CIRCLE_RADIUS} ${GUIDE_CIRCLE_RADIUS} 0 ${
                endAngle - startAngle > Math.PI ? 1 : 0
              } 1 ${Math.cos(endAngle) * GUIDE_CIRCLE_RADIUS} ${
                Math.sin(endAngle) * GUIDE_CIRCLE_RADIUS
              } Z`}
              fill={colorScale(classification)}
              opacity={0.1}
            />
            <defs>
              <path
                id={`textPath-${classification}`}
                d={`M ${Math.cos(startAngle) * TEXT_RADIUS} ${
                  Math.sin(startAngle) * TEXT_RADIUS
                } A ${TEXT_RADIUS} ${TEXT_RADIUS} 0 ${
                  endAngle - startAngle > Math.PI ? 1 : 0
                } 1 ${Math.cos(endAngle) * TEXT_RADIUS} ${
                  Math.sin(endAngle) * TEXT_RADIUS
                }`}
              />
            </defs>
            <text fill={colorScale(classification)} fontSize='18px'>
              <textPath
                xlinkHref={`#textPath-${classification}`}
                startOffset='50%'
              >
                {classification}
              </textPath>
            </text>
          </g>
        );
      })}
      {
        // draw a circle with increasing radius to indicate the distance from the center of the svg.
        // the radii lie between CIRCLE_RADIUS_MIN and CIRCLE_RADIUS and are spaced CIRCLE_RADIUS_STEP apart.
        Array.from(
          { length: Math.floor(GUIDE_CIRCLE_RADIUS / GUIDE_CIRCLE_STEP) },
          (_, index) => {
            return (
              <circle
                key={index}
                cx={0}
                cy={0}
                r={GUIDE_CIRCLE_RADIUS_MIN + GUIDE_CIRCLE_STEP * index}
                fill={"none"}
                stroke={"black"}
                opacity={0.1}
              />
            );
          }
        )
      }

      {sortedIntersectionData.map(([key, intersectionDatum], index) => {
        console.log(intersectionLengthScale(intersectionDatum.setSize));
        return (
          <circle
            key={key}
            cx={
              Math.cos(
                ((index + 0.5) * 2 * Math.PI) / sortedIntersectionData.length
              ) *
              (GUIDE_CIRCLE_RADIUS -
                intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
            }
            cy={
              Math.sin(
                ((index + 0.5) * 2 * Math.PI) / sortedIntersectionData.length
              ) *
              (GUIDE_CIRCLE_RADIUS -
                intersectionDatum.jaccard * GUIDE_CIRCLE_RADIUS)
            }
            r={
              CIRCLE_RADIUS +
              intersectionLengthScale(intersectionDatum.setSize) * CIRCLE_RADIUS
            }
            fill={colorScale(intersectionDatum.classification)}
            opacity={0.7}
          />
        );
      })}
      <circle cx={0} cy={0} r={10} fill={"red"} />
    </g>
  );
};

export default RadarChart;
