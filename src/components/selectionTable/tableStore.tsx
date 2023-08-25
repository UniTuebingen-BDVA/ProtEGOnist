import { atom, useAtom } from 'jotai';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { getEgoNetworkNetworkAtom, getRadarAtom } from '../../apiCalls';
import { multiSelectionAtom } from '../TabViewer/tabViewerStore';
import RadarIcon from '@mui/icons-material/Radar';
import * as d3 from 'd3';
export const tableAtomStore = atom<{
    rows: GridRowsProp;
    columns: GridColDef[];
}>({
    rows: [],
    columns: []
});

interface rowData {
    row: {
        UniprotID_inString: string;
        // other properties of the row object
    };
}

export const columnVisibilityAtom = atom<{ [key: string]: boolean }>({
    Radar: true,
    ID: false,
    drug_name: true,
    GDSC: false,
    y_id: false,
    x_id: true,
    n: false,
    beta: false,
    pval: false,
    fdr: false,
    nc_beta: false,
    nc_pval: false,
    nc_fdr: false,
    r2: false,
    target: true,
    ppi: false,
    skew: false,
    cancer_gene: false,
    UniprotID_inString: true
});

const RadarButton = (params: rowData) => {
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [multiSelection, setMultiSelection] = useAtom(multiSelectionAtom);
    return (
        <button
            type="button"
            onClick={() => {
                const selectedName = params.row['UniprotID_inString'];
                const multiSelectionLocal = multiSelection.slice();
                multiSelectionLocal.push(selectedName);
                if (multiSelectionLocal.length > 3) {
                    multiSelectionLocal.shift();
                }
                setMultiSelection(multiSelectionLocal);
                getRadarData(selectedName);
            }}
        >
            <RadarIcon />
        </button>
    );
};

export const selectedProteinsStoreAtom = atom<string[]>([]);

export const selectedProteinsAtom = atom(
    (get) => {
        return get(selectedProteinsStoreAtom);
    },
    (get, set, ids: string[]) => {
        const idCopy = get(selectedProteinsStoreAtom).slice();
        const toDelete: number[] = [];
        ids.forEach((id, i) => {
            if (idCopy.includes(id)) {
                toDelete.push(i);
            } else {
                idCopy.push(id);
            }
        });
        toDelete.reverse();
        toDelete.forEach((index) => idCopy.splice(index, 1));
        set(selectedProteinsStoreAtom, idCopy);
        set(getEgoNetworkNetworkAtom, idCopy);
        const indices = idCopy.map((protein) => {
            return get(tableAtomStore).rows.findIndex((row) => {
                return row['UniprotID_inString'] === protein;
            })+1;
        });
        set(tableModelAtom, indices);
    }
);

export const drugsPerProteinColorscaleAtom = atom((get) => {
    const drugsPerProtein = get(drugsPerProteinAtom);
    const max = Math.max(...Object.values(drugsPerProtein));
    const min = Math.min(...Object.values(drugsPerProtein));
    // generate a colorscale based on the number of drugs per protein with d3 from white to #ff7f00
    const colorScale = d3
        .scaleLinear<string>()
        .domain([min, max])
        .range(['#ffffff', '#ff7f00']);
    return colorScale;
});

export const drugsPerProteinAtom = atom<{ [key: string]: number }>({});

export const tableModelAtom = atom<number[]>([]);

export const tableAtom = atom(
    (get) => get(tableAtomStore),
    (_get, set, update: { rows: GridRowsProp; columns: GridColDef[] }) => {
        // add a Radar button to the columns when tableAtom is set
        // get all unique uniprot ids (UniprotID_inString)
        const uniprotIds = update.rows.map((row) => row['UniprotID_inString']);
        // generate set of unique uniprot ids
        const uniqueUniprotIds = [...new Set(uniprotIds)];

        const drugsPerProtein:{[key: string]: number} = {};

        for (const uniprotId of uniqueUniprotIds) {
            const filteredRows = update.rows.filter((row) => {
                return row['UniprotID_inString'] === uniprotId;
            });
            const drugNames = filteredRows.map((row) => row['drug_name']);
            const uniqueDrugNames = [...new Set(drugNames)];
            drugsPerProtein[uniprotId] = uniqueDrugNames.length;
        }
        set(drugsPerProteinAtom, drugsPerProtein);
        // generate set of unique drug names
        update.columns.unshift({
            field: 'Radar',
            headerName: 'Radar',
            width: 100,
            renderCell: RadarButton
        });

        set(tableAtomStore, update);
    }
);
