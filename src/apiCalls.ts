import axios from 'axios';
import { atom } from 'jotai';
import {
    egoGraph,
    intersectionDatum,
    egoNetworkNetwork
} from './egoGraphSchema.ts';
import {
    intersectionAtom,
    leavingNodesAtom,
    changedNodesAtom,
    tarNodeAtom,
    lastSelectedNodeAtom
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
    egoNetworkNetworksAtom
} from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { calculateLayout } from './components/egograph/egolayout.ts';
import { egoNetworkNetworksOverviewAtom } from './components/overview_component/egoNetworkNetworkOverviewStore.ts';

export const getMultiEgographBundleAtom = atom(
    (get) => get(egoGraphBundlesLayoutAtom),
    (get, set, bundleIds: string[][]) => {
        bundleIds.forEach((ids) => {
            const jointID = ids.join(',');
            if (
                !Object.keys(get(egoGraphBundlesLayoutAtom)).includes(jointID)
            ) {
                axios
                    .post<{
                        egoGraphs: egoGraph[];
                        intersections: { [key: string]: string[] };
                    }>('/api/egograph_bundle', { ids: ids })
                    .then(
                        (result) => {
                            const { egoGraphs, intersections } = result.data;
                            set(egoGraphBundlesLayoutAtom, {
                                ...get(egoGraphBundlesLayoutAtom),
                                [jointID]: calculateLayout(
                                    egoGraphs,
                                    intersections,
                                    get(decollapsedSizeAtom)[ids.length - 1],
                                    get(innerRadiusAtom),
                                    get(outerRadiusAtom)
                                )
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
        Object.keys(get(egoGraphBundlesLayoutAtom))
            .filter((id) => !bundleIds.map((ids) => ids.join(',')).includes(id))
            .forEach((id) => {
                const egographBundleLayout = get(egoGraphBundlesLayoutAtom);
                delete egographBundleLayout[id];
                set(egoGraphBundlesLayoutAtom, egographBundleLayout);
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
export const accountedProteinsNeigborhoodStoreAtom = atom<Set<string>>([]);

export const accountedProteinsNeigborhoodAtom = atom(
    (get) => {
        return get(accountedProteinsNeigborhoodStoreAtom);
    },
    (get, set, update: string[][]) => {
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
    (get, set, ids: string[]) => {
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
export const getEgoNetworkNetworkOverviewAtom = atom(
    (get) => get(egoNetworkNetworksOverviewAtom),
    (get, set, ids: string[]) => {
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
