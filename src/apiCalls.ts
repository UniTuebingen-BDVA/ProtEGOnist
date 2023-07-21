import axios, { AxiosResponse } from 'axios';
import { atom } from 'jotai';
import { egoGraph, intersectionDatum } from './egoGraphSchema';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    intersectionAtom,
    tarNodeAtom
} from './components/radarchart/radarStore.ts';
import { tableAtom } from './components/selectionTable/tableStore.ts';
import { calculateEgoLayout } from './components/egograph/egolayout.ts';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
import { GridRowsProp, GridColDef } from '@mui/x-data-grid';

export const getEgographAtom = atom(
    (get) => get(graphAtom),
    async (get, set, id: string) => {
        const result = await axios.get<egoGraph>(
            `/api/test_data_egograph/${id}`
        );
        const layout = calculateEgoLayout(
            result.data,
            get(innerRadiusAtom),
            get(outerRadiusAtom)
        );
        set(graphAtom, layout);
    }
);

export const getRadarAtom = atom(
    (get) => get(intersectionAtom),
    async (_get, set, id: string) => {
        const result = await axios.get<{
            [name: string | number]: intersectionDatum;
        }>(`/api/testEgoRadar/${id}`);
        set(intersectionAtom, result.data);
        set(tarNodeAtom, id);
    }
);

export const getTableAtom = atom(
    (get) => get(tableAtom),
    async (_get, set) => {
        const result = await axios.get<{
            rows: GridRowsProp;
            columns: GridColDef[];
        }>('/api/getTableData');
        set(tableAtom, result.data);
    }
);
