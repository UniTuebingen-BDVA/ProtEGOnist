// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axios from 'axios';
import { atom, useAtom } from 'jotai';
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
import { tableAtom,selectedProteinsAtom  } from './components/selectionTable/tableStore.tsx';
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
export const showOnTooltipAtom = atom([]);
export const nameNodesByAtom = atom("nodeID");
export const quantifyNodesByAtom = atom({});
export const classifyByAtom = atom("");
export const chosenSetAtom = atom(null);
export const edgesClassificationAtom = atom(null);

export const selectedExampleAtom = atom(
    (get) => get(chosenSetAtom),
    (get, set, example:string)  => {
            set(chosenSetAtom, example);
            axios
                .get(`/api/get_labelling_keys/${example}`)
                .then(
                    (response) =>{
                        const {nameNodesBy, showOnTooltip, quantifyBy, classifyBy, startRadarNode, startSelectedNodes} = response.data;
                        set(nameNodesByAtom, nameNodesBy);
                        set(showOnTooltipAtom, showOnTooltip);
                        set(quantifyNodesByAtom, quantifyBy);
                        set(classifyByAtom,classifyBy);
                        set(tarNodeAtom, startRadarNode);
                        set(getRadarAtom,startRadarNode);
                        set(selectedProteinsAtom, startSelectedNodes);
                        let edgesClassification = response.data?.edgesClassification ?? null;
                        if (edgesClassification !== null) {
                            set(edgesClassificationAtom, edgesClassification);
                        }
                    },
                    (e) => {
                    console.error(e)
                    }

                )
        
    }

);
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
            const example = get(selectedExampleAtom);
        newBundlesIds.forEach((ids) => {
                const jointID = ids.join(',');
                axios
                    .post<{
                        egoGraphs: egoGraph[];
                        intersections: { [key: string]: string[] };
                    }>(`/api/egograph_bundle`, { ids: ids, example: example })
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
        let example = get(selectedExampleAtom);
        axios
            .get<{
                [name: string | number]: intersectionDatum;
            }>(`/api/EgoRadar/${example}/${id}`)
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
    (get, set) => {
        let example = get(selectedExampleAtom);
        axios
            .get<{
                rows: GridRowsProp;
                columns: GridColDef[];
            }>(`/api/getTableData/${example}`)
            .then((result) => {
                set(tableAtom, result.data);
            }, console.error);
    }
);

export const getEgoNetworkNetworkAtom = atom(
    (get) => get(egoNetworkNetworksAtom),
    (get, set, ids: string[]) => {
        let example = get(selectedExampleAtom);
        set(egoNetworkNetworkBusyAtom, true);
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetwork/${example}/${ids.join('+')}`
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
        let example = get(selectedExampleAtom);
        axios
            .all([
                axios.get<{
                    [name: string | number]: intersectionDatum;
                }>(`/api/EgoRadar/${example}/${id}`),
                axios.get<egoNetworkNetwork>(
                    `/api/getEgoNetworkNetwork/${example}/${ids.join('+')}`
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
    (get, set,  ids: string[]) => {
        let example = get(selectedExampleAtom);
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetworkOverview/${example}`
            )
            .then(
                (result) => {
                    set(egoNetworkNetworksOverviewAtom, result.data.network);
                    startDataOverview = result.data.overviewNodes;
                },
                () => {
                    console.error,
                        console.log(
                            `couldn't get Overview egographs with ID ${ids.join(';')}`
                        );
                }
            );
    }
);

export let startDataOverview ;
