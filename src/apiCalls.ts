// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axios from 'axios';
import { atom } from 'jotai';
import {
    egoGraph,
    intersectionDatum,
    egoNetworkNetwork
} from './egoGraphSchema.ts';
import {
    intersectionAtom,
    tarNodeAtom,
    radarNodesAtom
} from './components/radarchart/radarStore.ts';
import { tableAtom } from './components/selectionTable/tableStore.tsx';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import {
    egoGraphBundlesLayoutAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/egoGraphBundleStore.ts';
import {
    decollapsedSizeAtom,
    decollapseIDsArrayAtom,
    egoNetworkNetworksAtom
} from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { calculateLayout } from './components/egograph/egolayout.ts';
import { egoNetworkNetworksOverviewAtom } from './components/overview_component/egoNetworkNetworkOverviewStore.ts';
import { decollapseModeAtom } from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';

export const serverBusyAtom = atom(false);
export const radarChartBusyAtom = atom(false);
export const egoNetworkNetworkBusyAtom = atom(false);
export const getMultiEgographBundleAtom = atom(
    (get) => get(egoGraphBundlesLayoutAtom),
    (get, set, bundleIds: string[][]) => {
        Object.keys(get(egoGraphBundlesLayoutAtom))
            .filter((id) => !bundleIds.map((ids) => ids.join(',')).includes(id))
            .forEach((id) => {
                const egographBundleLayout = get(egoGraphBundlesLayoutAtom);
                delete egographBundleLayout[id];
                console.log(id);
                set(egoGraphBundlesLayoutAtom, egographBundleLayout);
            });
        const newBundlesIds = bundleIds.filter(
            (ids) =>
                !Object.keys(get(egoGraphBundlesLayoutAtom)).includes(
                    ids.join(',')
                )
        );
        if (newBundlesIds.length > 0) {
            set(egoNetworkNetworkBusyAtom, true);
            let requestCounter = 0;
            newBundlesIds.forEach((ids) => {
                const jointID = ids.join(',');
                axios
                    .post<{
                        egoGraphs: egoGraph[];
                        intersections: { [key: string]: string[] };
                    }>('/api/egograph_bundle', { ids: ids })
                    .then(
                        (result) => {
                            const { egoGraphs, intersections } = result.data;
                            const decollapseMode = get(decollapseModeAtom);
                            set(egoGraphBundlesLayoutAtom, {
                                ...get(egoGraphBundlesLayoutAtom),
                                [jointID]: calculateLayout(
                                    egoGraphs,
                                    intersections,
                                    get(innerRadiusAtom),
                                    get(outerRadiusAtom),
                                    decollapseMode
                                )
                            });
                            requestCounter += 1;
                            if (requestCounter === newBundlesIds.length) {
                                set(egoNetworkNetworkBusyAtom, false);
                                set(decollapseIDsArrayAtom, bundleIds);
                            }
                        },
                        () => {
                            console.error,
                                console.log(
                                    `couldn't get egograph with IDs ${ids}`
                                );
                        }
                    );
            });
        } else {
            set(decollapseIDsArrayAtom, bundleIds);
        }
    }
);

const compareIntersections = (
    oldIntersections: {
        [p: string]: intersectionDatum;
        [p: number]: intersectionDatum;
    },
    newIntersections: {
        [p: string]: intersectionDatum;
        [p: number]: intersectionDatum;
    }
) => {
    const oldKeys = Object.keys(oldIntersections);
    const newKeys = Object.keys(newIntersections);
    const changedNodes = newKeys.filter((x) => !oldKeys.includes(x));
    const leavingNodes = oldKeys.filter((x) => !newKeys.includes(x));
    return { changedNodes, leavingNodes };
};
export const getRadarAtom = atom(
    (get) => get(intersectionAtom),
    (get, set, id: string) => {
        set(radarChartBusyAtom, true);
        axios
            .get<{
                [name: string | number]: intersectionDatum;
            }>(`/api/EgoRadar/${id}`)
            .then(
                (result) => {
                    // compare the keys of the new and old intersection atoms
                    const { changedNodes, leavingNodes } = compareIntersections(
                        get(intersectionAtom),
                        result.data
                    );
                    // Changed to object in order to have less set calls
                    set(radarNodesAtom, {
                        changed: changedNodes,
                        leaving: leavingNodes,
                        intersection: result.data
                    });
                    set(tarNodeAtom, id);
                    set(radarChartBusyAtom, false);
                },
                () => {
                    console.error,
                        console.log(`couldn't get radar with ID ${id}`);
                }
            );
    }
);
export const accountedProteinsNeigborhoodStoreAtom = atom<Set<string>>(
    new Set([])
);

export const accountedProteinsNeigborhoodAtom = atom(
    (get) => {
        return get(accountedProteinsNeigborhoodStoreAtom);
    },
    (_get, set, update: string[][]) => {
        // Flatten list
        let flatArray = update.reduce((acc, val) => acc.concat(val), []);

        let accountedProteins = new Set(flatArray);
        set(accountedProteinsNeigborhoodStoreAtom, accountedProteins);
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
    (_get, set, ids: string[]) => {
        set(egoNetworkNetworkBusyAtom, true);
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetwork/${ids.join('+')}`
            )
            .then(
                (result) => {
                    set(
                        accountedProteinsNeigborhoodAtom,
                        result.data.nodes.map((node) => node.neighbors)
                    );
                    set(egoNetworkNetworksAtom, result.data);
                    set(egoNetworkNetworkBusyAtom, false);
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

export const getEgoNetworkAndRadar = atom(
    (get) => get(egoNetworkNetworksAtom),
    (get, set, ids: string[], id: string) => {
        set(serverBusyAtom, true);
        axios
            .all([
                axios.get<{
                    [name: string | number]: intersectionDatum;
                }>(`/api/EgoRadar/${id}`),
                axios.get<egoNetworkNetwork>(
                    `/api/getEgoNetworkNetwork/${ids.join('+')}`
                )
            ])
            .then(
                axios.spread((radarResponse, networkResponse) => {
                    const { changedNodes, leavingNodes } = compareIntersections(
                        get(intersectionAtom),
                        radarResponse.data
                    );
                    // Changed to object in order to have less set calls
                    set(radarNodesAtom, {
                        changed: changedNodes,
                        leaving: leavingNodes,
                        intersection: radarResponse.data
                    });
                    set(tarNodeAtom, id);
                    set(
                        accountedProteinsNeigborhoodAtom,
                        networkResponse.data.nodes.map((node) => node.neighbors)
                    );
                    set(egoNetworkNetworksAtom, networkResponse.data);
                    set(serverBusyAtom, false);
                })
            )
            .catch(() => {
                console.error,
                    console.log(
                        `couldn't get egographswith ID ${ids.join(';')}`
                    );
            });
    }
);
export const getEgoNetworkNetworkOverviewAtom = atom(
    (get) => get(egoNetworkNetworksOverviewAtom),
    (_get, set, ids: string[]) => {
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetwork/${ids.join('+')}`
            )
            .then(
                (result) => {
                    set(egoNetworkNetworksOverviewAtom, result.data);
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

export const startDataOverview = [
    'Q9ULU4',
    'P63279',
    'Q14157',
    'Q9UBT2',
    'O95881',
    'Q13263',
    'P12270',
    'Q99805',
    'P23193',
    'O75347',
    'P37837',
    'P53597',
    'O43752',
    'Q13586',
    'Q9UNL2',
    'P37108',
    'Q7KZF4',
    'O75940',
    'Q92922',
    'Q9GZT3',
    'P05141',
    'O43765',
    'Q9UBE0',
    'P46782',
    'P63220',
    'P62263',
    'P05387',
    'P62910',
    'P47914',
    'P83731',
    'P62829',
    'P30050',
    'Q9GZR2',
    'Q14498',
    'Q96PZ0',
    'Q9Y3E5',
    'Q06124',
    'Q8WWY3',
    'Q9UMS4',
    'P78527',
    'P14314',
    'O43447',
    'P19387',
    'Q8TCS8',
    'Q9H307',
    'Q13492',
    'P30086',
    'Q15102',
    'P49790',
    'P57740',
    'O15226',
    'O95168',
    'Q96EL3',
    'Q8N983',
    'Q96DV4',
    'P46013',
    'Q9BTE3',
    'Q14566',
    'P31153',
    'Q9UNF1',
    'Q8NC56',
    'Q13751',
    'Q8IYS2',
    'O95373',
    'P11142',
    'P61978',
    'P52789',
    'Q6ZRV2',
    'O75477',
    'Q9NPA0',
    'Q15369',
    'Q15370',
    'P42126',
    'P51452',
    'Q9NXW2',
    'Q9UBS4',
    'Q96HY7',
    'Q92841',
    'Q16850',
    'Q13618',
    'Q99829',
    'P20674',
    'Q14008',
    'Q5SW79',
    'Q99459',
    'Q01518',
    'Q9UBB4',
    'P61421',
    'P52565',
    'P00568',
    'Q9NRN7'
];
