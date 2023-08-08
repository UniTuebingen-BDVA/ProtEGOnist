import axios, { AxiosResponse } from 'axios';
import { atom } from 'jotai';
import {
    egoGraph,
    intersectionDatum,
    egoNetworkNetwork
} from './egoGraphSchema';
import {
    intersectionAtom,
    leavingNodesAtom,
    changedNodesAtom,
    tarNodeAtom
} from './components/radarchart/radarStore.ts';
import { tableAtom } from './components/selectionTable/tableStore.ts';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { egoGraphBundlesDataAtom } from './components/egograph/egoGraphBundleStore.ts';
import { egoNetworkNetworksAtom } from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';

export const getMultiEgographBundleAtom = atom(
    (get) => get(egoGraphBundlesDataAtom),
    (get, set, bundleIds: string[][]) => {
        bundleIds.forEach((ids) => {
            const jointID = ids.join(',');
            if (!Object.keys(get(egoGraphBundlesDataAtom)).includes(jointID)) {
                axios
                    .post<{
                        egoGraphs: egoGraph[];
                        intersections: { [key: string]: string[] };
                    }>('/api/egograph_bundle', { ids: ids })
                    .then(
                        (result) => {
                            set(egoGraphBundlesDataAtom, {
                                ...get(egoGraphBundlesDataAtom),
                                [jointID]: result.data
                            });
                        },
                        () => {
                            console.error,
                                console.log(
                                    `couldn't get egograph with IDs ${ids}`
                                );
                        }
                    );
            }
        });
        Object.keys(get(egoGraphBundlesDataAtom))
            .filter((id) => !bundleIds.map((ids) => ids.join(',')).includes(id))
            .forEach((id) => {
                const egographBundleData = get(egoGraphBundlesDataAtom);
                delete egographBundleData[id];
                set(egoGraphBundlesDataAtom, egographBundleData);
            });
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
