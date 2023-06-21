import { generateHeatmap } from "./heatmap.ts";
import { parseProteinMatrix } from "./dataParsing.ts";

// create data with parseProteinMatrix and generate a heatmap
let data = parseProteinMatrix(
  "../data/ProCan-DepMapSanger_protein_matrix_8498_averaged.txt"
);
data.then((data) => {
  console.log(data);
  generateHeatmap(data);
});
