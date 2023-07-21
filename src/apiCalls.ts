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
    (get, set, id: string) => {
        axios.get<egoGraph>(`/api/test_data_egograph/${id}`).then(
            (result) => {
                const layout = calculateEgoLayout(
                    result.data,
                    get(innerRadiusAtom),
                    get(outerRadiusAtom)
                );
                set(graphAtom, layout);
            },
            () => {
                console.error,
                    console.log(`couldn't get egograph with ID ${id}`);
            }
        );
    }
);

export const getRadarAtom = atom(
    (get) => get(intersectionAtom),
    (_get, set, id: string) => {
        axios
            .get<{
                [name: string | number]: intersectionDatum;
            }>(`/api/testEgoRadar/${id}`)
            .then(
                (result) => {
                    set(intersectionAtom, result.data);
                    set(tarNodeAtom, id);
                },
                () => {
                    console.error,
                        console.log(`couldn't get radar with ID ${id}`);
                }
            );
    }
);

export const getTableAtom = atom(
    (get) => get(tableAtom),
    (_get, set) => {
        axios
            .get<{
                rows: GridRowsProp;
                columns: GridColDef[];
            }>('/api/getTableData')
            .then((result) => {
                set(tableAtom, result.data);
            }, console.error);
    }
);
