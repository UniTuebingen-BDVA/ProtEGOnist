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
        nodeID: string;
        // other properties of the row object
    };
}

export const columnVisibilityAtom = atom<{ [key: string]: boolean }>({
    Radar: true,
    drug_name: true,
    x_id: true,
    nodeID: true,
    selected: true
});

const RadarButton = (params: rowData) => {
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const [multiSelection, setMultiSelection] = useAtom(multiSelectionAtom);
    return (
        <button
            type="button"
            onClick={() => {
                const selectedName = params.row['nodeID'];
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
        const selectedProteinsStoreValue = get(selectedProteinsStoreAtom);

        // Remove duplicates from the incoming `ids` array
        const uniqueIds = [...new Set(ids)];

        // Calculate proteins to delete and proteins to add

        // Which prots are not there yet
        const proteinsToAdd = uniqueIds.filter(id => !selectedProteinsStoreValue.includes(id));

        // Which prots are already there and should be deleted
        const proteinsToDelete = selectedProteinsStoreValue.filter(id => uniqueIds.includes(id));

        // Update selected proteins with optimized array operations
        const updatedProteins = selectedProteinsStoreValue.filter(id => !proteinsToDelete.includes(id)).concat(proteinsToAdd);

        set(selectedProteinsStoreAtom, updatedProteins);
        set(getEgoNetworkNetworkAtom, updatedProteins);
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

export const tableModelSelectedAtom = atom<number[]>((get) => {
    const selectedProteins = get(selectedProteinsAtom);
    const tableRows = get(tableAtomStore).rows;
    const indexSelectedProts = Object.keys(tableRows).map((key, index) => selectedProteins.includes(key) ? index : -1).filter(index => index !== -1);
    return indexSelectedProts
}
);

export const tableAtom = atom(
    (get) => get(tableAtomStore),
    (_get, set, update: { rows: GridRowsProp; columns: GridColDef[] }) => {
        // add a Radar button to the columns when tableAtom is set
        // get all unique keys (nodeID) from dictionary and put them in an array
        const nodeIDs = Object.keys(update.rows)
        // generate set of unique uniprot ids
        const uniquenodeIDs = [...new Set(nodeIDs)];

        const drugsPerProtein: { [key: string]: number } = {};

        for (const nodeID of uniquenodeIDs) {
            const rowProtein = update.rows[nodeID];
            const drugNames = rowProtein["drug_name"].split(';');
            const uniqueDrugNames = [...new Set(drugNames)];
            drugsPerProtein[nodeID] = uniqueDrugNames.length;
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
