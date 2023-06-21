import * as d3 from "d3";

interface ProteinMatrix {
  proteinIDs: string[];
  cellLineIDs: string[];
  values: [number, number, number][];
}

export function generateHeatmap(proteinMatrix: ProteinMatrix) {
  console.log("generateHeatmap");
  console.log(proteinMatrix);
  const { proteinIDs, cellLineIDs, values } = proteinMatrix;
  console.log(proteinIDs, cellLineIDs, values);
  // generate the heatmap
  let heatmap = d3.select("#heatmap");
  let height = 1000;
  let width = 1920;
  let margin = { top: 20, right: 20, bottom: 100, left: 25 };
  let headerOffset = 50;
  let h = height - margin.top - margin.bottom;
  let w = width - margin.left - margin.right;

  // create the scales
  //create indexRange for cellLineIDs and proteinIDs
  let indexCellLineRange = Array.from(Array(cellLineIDs.length).keys());
  let indexProteinRange = Array.from(Array(proteinIDs.length).keys());

  let x = d3.scaleBand().domain(indexProteinRange).range([0, w]);
  let y = d3.scaleBand().domain(indexCellLineRange).range([headerOffset, h]);

  let extent = d3.extent(values, (d) => d[2]);
  if (extent[0] === undefined || extent[1] == undefined)
    throw new Error("extent is undefined");

  // create the color scale for the heatmap cells based on the values of the cells and the viridis color scheme
  let color = d3.scaleSequential(d3.interpolateViridis).domain(extent);

  // create the axes
  let xAxis = d3.axisBottom(x);
  let yAxis = d3.axisLeft(y);

  // create the svg
  let svg = heatmap.append("svg").attr("height", height).attr("width", width);

  // create the group for the heatmap
  let g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // create the cells
  g.selectAll(".cell")
    .data(values)
    .enter()
    .append("rect")
    .attr("class", "cell")
    .attr("x", (d) => {
      const xPos = x(d[1]);
      if (xPos === undefined) throw new Error("xPos is undefined");
      return xPos;
    })
    .attr("y", (d) => {
      const yPos = y(d[0]);
      if (yPos === undefined) throw new Error("yPos is undefined");
      return yPos;
    })
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .attr("fill", function (d) {
      return color(d[2]);
    });

  // create the axes
  g.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + h + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .style("font-size", "7px")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");
  g.append("g")
    .attr("class", "yAxis")
    .call(yAxis)
    .selectAll("text")
    .style("font-size", "5px");

  svg.on("click", function () {
    const serializer = new XMLSerializer();
    let svgStringFinal = serializer.serializeToString(svg?.node());
    //add name spaces.
    if (
      !svgStringFinal.match(
        /^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/
      )
    ) {
      svgStringFinal = svgStringFinal.replace(
        /^<svg/,
        '<svg xmlns="http://www.w3.org/2000/svg"'
      );
    }
    if (
      !svgStringFinal.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)
    ) {
      svgStringFinal = svgStringFinal.replace(
        /^<svg/,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
    }
    svgStringFinal =
      '<?xml version="1.0" standalone="no"?>\r\n' + svgStringFinal;
    const svgBlob = new Blob([svgStringFinal], {
      type: "image/svg+xml;charset=utf-8",
    });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "heatmap.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  });
}
