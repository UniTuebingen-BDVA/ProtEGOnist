import { atom, useAtom } from 'jotai';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';
import { getRadarAtom } from '../../apiCalls';
import { multiSelectionAtom } from '../TabViewer/tabViewerStore';
import RadarIcon from '@mui/icons-material/Radar';
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

export const selectedProteinsAtom = atom<string[]>([]);

export const tableAtom = atom(
    (get) => get(tableAtomStore),
    (get, set, update: { rows: GridRowsProp; columns: GridColDef[] }) => {
        // add a Radar button to the columns when tableAtom is set
        update.columns.unshift({
            field: 'Radar',
            headerName: 'Radar',
            width: 100,
            renderCell: RadarButton
        });
        set(tableAtomStore, update);
    }
);
