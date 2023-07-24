import { atom } from 'jotai';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';

export const tableAtom = atom<{ rows: GridRowsProp; columns: GridColDef[] }>({
    rows: [],
    columns: []
});
