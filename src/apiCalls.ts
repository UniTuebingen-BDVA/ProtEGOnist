import axios from 'axios';
import { atom } from 'jotai';
import { egoGraph, intersectionDatum } from './egoGraphSchema';
import {
    intersectionAtom,
    tarNodeAtom
} from './components/radarchart/radarStore.ts';
import { tableAtom } from './components/selectionTable/tableStore.ts';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { egoGraphBundleDataAtom } from './components/egograph/egoGraphBundleStore.ts';

/*export const getEgographAtom = atom(
    (get) => get(graphAtom),
    (get, set, id: string) => {
        axios.get<egoGraph>(`/api/test_data_egograph/${id}`).then(
            (result) => {
                const layout = calculateEgoLayout(
                    result.data,
                    get(innerRadiusAtom),
                    get(outerRadiusAtom),
                );
                set(graphAtom, layout);
            },
            () => {
                console.error,
                    console.log(`couldn't get egograph with ID ${id}`);
            }
        );
    }
);*/
export const getEgographBundleAtom = atom(
    (get) => get(egoGraphBundleDataAtom),
    (_get, set, ids: string[]) => {
        axios
            .post<{
                egoGraphs: egoGraph[];
                intersections: { [key: string]: string[] };
            }>('/api/egograph_bundle', { ids: ids })
            .then(
                (result) => {
                    set(egoGraphBundleDataAtom, result.data);
                },
                () => {
                    console.error,
                        console.log(`couldn't get egograph with IDs ${ids}`);
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
                    console.error;
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
