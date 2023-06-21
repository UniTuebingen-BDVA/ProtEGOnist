import * as d3 from "d3";

export function parseProteinMatrix(dataPath: string) {
  // read in a n * m matrix of n proteins and m cell lines with the values bein measured protein levels
  // the first row contains the protein IDS and the first column contains the cell line IDS
  // and parse them to long format
  // save an array of the protein IDS and the cell line IDS
  // and save the matrix as an array of objects with the following structure
  // {id: id, variable: variable, value: value}
  // where id is the cell line ID, variable is the protein ID and value is the measured protein level
  // return an object containing the array of protein IDS, the array of cell line IDS and the array of objects

  // read in the data
  return d3.tsv(dataPath, d3.autoType).then(function (data) {
    // get the protein IDS
    const proteinIDs = data.columns;
    const idCol = proteinIDs.shift();
    if (idCol === undefined) throw new Error("idCol is undefined");
    // get the cell line IDS
    const cellLineIDs = data.map((d) => {
      return d[idCol];
    });
    cellLineIDs.slice(0, 250);
    // discard all but the first 50 rows
    data = data.slice(0, 250);

    //remove the first element of the protein IDS

    // get the values
    const values: { id: string; variable: string; value: number }[] = [];
    data.forEach((d) => {
      const id = d[idCol];
      // get index of the id in the cell line IDS
      const rI = cellLineIDs.indexOf(id);
      proteinIDs.forEach((variable, cI) => {
        const value = +d[variable];
        const vals = [rI, cI, value];
        values.push(vals);
      });
    });

    // return the protein IDS, the cell line IDS and the values
    return { proteinIDs: proteinIDs, cellLineIDs: cellLineIDs, values: values };
  });
}
