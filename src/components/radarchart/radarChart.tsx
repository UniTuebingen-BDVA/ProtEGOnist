import {intersectionDatum} from "../../egoGraphSchema";
import * as d3 from "d3";

interface RadarChartProps {
  intersectionData: {[name: (string|number)]:intersectionDatum}
}

const RadarChart = (props: RadarChartProps) => {
  const {intersectionData} = props;
  // generate colorscale from the jaccard index values of the intersectionData
  const colorScale = d3.scaleLinear()
    .domain([0, 1])
    .range(["#00ffff", "#ff0000"]);
  //draw a circle svg for each intersectionDatum with a radius of the jaccard index value and a color from the colorScale.
  // position each of the 40 circles in a circle around the center of the svg such that we only have a single revolution but also allow for some space between the circles.
  // circles with a higher jaccard index value are drawn closer to the center of the svg. with the minimum radius being 10 and the maximum radius being 200.
  // also add a circular grid to the svg to make it easier to see the distance between the circles.
  return (
    <g>
      <circle cx={0} cy={0} r={200} fill={"none"} stroke={"slategray"}/>
      <circle cx={0} cy={0} r={150} fill={"none"} stroke={"slategray"}/>
      <circle cx={0} cy={0} r={100} fill={"none"} stroke={"slategray"}/>
      <circle cx={0} cy={0} r={50} fill={"none"} stroke={"slategray"}/>
      {Object.entries(intersectionData).map(([key, intersectionDatum], index) => {
        return <circle
          key={key}
          cx={Math.cos(index * 2 * Math.PI / 40) * (200 - intersectionDatum.jaccard*190)}
          cy={Math.sin(index * 2 * Math.PI / 40) * (200 - intersectionDatum.jaccard*190)}
          r={10 + intersectionDatum.jaccard*10}
          fill={colorScale(intersectionDatum.jaccard)}
        />
      }
      )}
    </g>
  )
}

export default RadarChart