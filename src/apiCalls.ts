import axios, { AxiosResponse } from 'axios';
import { atom } from 'jotai';
import {
    egoGraph,
    intersectionDatum,
    egoNetworkNetwork
} from './egoGraphSchema';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    intersectionAtom,
    leavingNodesAtom,
    changedNodesAtom,
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
import { egoNetworkNetworksAtom } from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';

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
    (get, set, id: string) => {
        axios
            .get<{
                [name: string | number]: intersectionDatum;
            }>(`/api/testEgoRadar/${id}`)
            .then(
                (result) => {
                    // compare the keys of the new and old intersection atoms
                    const oldKeys = Object.keys(get(intersectionAtom));
                    const newKeys = Object.keys(result.data);
                    const changedNodes = newKeys.filter(
                        (x) => !oldKeys.includes(x)
                    );
                    const leavingNodes = oldKeys.filter(
                        (x) => !newKeys.includes(x)
                    );
                    console.log(' nodes', changedNodes);
                    set(leavingNodesAtom, leavingNodes);
                    set(changedNodesAtom, changedNodes);
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

export const getEgoNetworkNetworkAtom = atom(
    (get) => get(egoNetworkNetworksAtom),
    (get, set, ids: string[]) => {
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetwork/${ids.join('+')}`
            )
            .then(
                (result) => {
                    console.log('egoNetworkNetwork', result.data);
                    set(egoNetworkNetworksAtom, result.data);
                },
                () => {
                    console.error,
                        console.log(
                            `couldn't get egographswith ID ${ids.join(';')}`
                        );
                }
            );
    }
);
