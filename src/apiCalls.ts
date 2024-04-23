// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import axios from 'axios';
import * as d3 from 'd3';
import { Atom, atom } from 'jotai';
import {
    egoGraph,
    intersectionDatum,
    egoNetworkNetwork
} from './egoGraphSchema.ts';
import {
    intersectionAtom,
    tarNodeAtom,
    radarNodesAtom
} from './components/detailPanel/radarchart/radarStore.ts';
import {
    tableAtom,
    selectedProteinsAtom
} from './components/selectionTable/tableStore.tsx';
import { GridColDef, GridRowsProp } from '@mui/x-data-grid';
import {
    egoGraphBundlesAtom,
    egoNetworkNetworksAtom,
    updateEgoGraphBundleAtom,
    selectedNodesAtom
} from './components/egoNetworkNetwork/egoNetworkNetworkStore.ts';

import {
    nodeAtom,
    linkAtom
} from './components/detailPanel/detailNodeLink/detailStore.ts';
import { egoNetworkNetworksOverviewAtom } from './components/overview_component/egoNetworkNetworkOverviewStore.ts';

export const serverBusyAtom = atom(false);
export const showOnTooltipAtom = atom([]);
export const nameNodesByAtom = atom('nodeID');
export const quantifyNodesByAtom = atom({});
export const classifyByAtom = atom('');
export const chosenSetAtom = atom(null);
export const edgesClassificationAtom = atom<{ [key: string]: number } | null>(
    null
);

export const selectedExampleAtom = atom(
    (get) => get(chosenSetAtom),
    (get, set, example: string) => {
        set(chosenSetAtom, example);
        axios.get(`/api/get_labelling_keys/${example}`).then(
            (response) => {
                const {
                    nameNodesBy,
                    showOnTooltip,
                    quantifyBy,
                    classifyBy,
                    startRadarNode,
                    startSelectedNodes
                } = response.data;
                set(nameNodesByAtom, nameNodesBy);
                set(showOnTooltipAtom, showOnTooltip);
                set(quantifyNodesByAtom, quantifyBy);
                set(classifyByAtom, classifyBy);
                set(tarNodeAtom, startRadarNode);
                set(getRadarAtom, startRadarNode);
                set(selectedProteinsAtom, startSelectedNodes);
                let edgesClassification =
                    response.data?.edgesClassification ?? null;
                if (edgesClassification !== null) {
                    set(edgesClassificationAtom, edgesClassification);
                }
            },
            (e) => {
                console.error(e);
            }
        );
    }
);
export const radarChartBusyAtom = atom(false);
export const egoNetworkNetworkBusyAtom = atom(false);
export const egoNetworkNetworkOverviewCoverageAtom = atom<{
    nodes: number;
    edges: number;
}>({});

export const getMultiEgographBundleAtom = atom(
    (get) => get(egoGraphBundlesAtom),
    (get, set, bundleIds: string[][]) => {
        const newBundlesIds = bundleIds.filter(
            (ids) =>
                !Object.keys(get(egoGraphBundlesAtom)).includes(ids.join(','))
        );
        const bumbleIdsToDelete = Object.keys(get(egoGraphBundlesAtom)).filter(
            (id) => !bundleIds.map((ids) => ids.join(',')).includes(id)
        );
        if (newBundlesIds.length > 0) {
            set(egoNetworkNetworkBusyAtom, true);
            const newData = {};
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
                            newData[jointID] = result.data;
                            /*set(addEgoGraphBundleAtom, {
                                ...result.data,
                                id: jointID
                            });*/
                            requestCounter += 1;
                            if (requestCounter === newBundlesIds.length) {
                                set(updateEgoGraphBundleAtom, {
                                    bundles: newData,
                                    ids: bumbleIdsToDelete
                                });
                                set(egoNetworkNetworkBusyAtom, false);
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
        } else if (bumbleIdsToDelete.length > 0) {
            set(updateEgoGraphBundleAtom, {
                bundles: [],
                ids: bumbleIdsToDelete
            });
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
        if (ids.length > 0) {
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
        } else {
            set(egoNetworkNetworksAtom, {
                nodes: [],
                edges: []
            });
            set(accountedProteinsNeigborhoodAtom, []);
            set(egoNetworkNetworkBusyAtom, false);
        }
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
    (get, set, ids: string[]) => {
        let example = get(selectedExampleAtom);
        axios
            .get<egoNetworkNetwork>(
                `/api/getEgoNetworkNetworkOverview/${example}`
            )
            .then(
                (result) => {
                    set(egoNetworkNetworksOverviewAtom, result.data.network);
                    set(
                        egoNetworkNetworkOverviewCoverageAtom,
                        result.data.coverage
                    );
                    startDataOverview = result.data.overviewNodes;
                },
                () => {
                    console.error,
                        console.log(
                            `couldn't get Overview egographs with ID ${ids.join(
                                ';'
                            )}`
                        );
                }
            );
    }
);

export const getNodeLinkFromSelectionAtom = atom(null, (get, set) => {
    let selectedNodesIds = get(selectedNodesAtom);
    let payload = {
        ids: selectedNodesIds,
        example: get(selectedExampleAtom)
    };
    axios
        .post('/api/getNodeLinkDiagram/', payload)
        .then((result) => {
            console.log(result);
            const nodes = result.data.nodes;
            const edges = result.data.edges;

            const outNodes = nodes.map((node) => {
                return {
                    id: node,
                    fill: 'red',
                    size: 2,
                    x: Math.random(),
                    y: Math.random()
                };
            });
            const outEdges = edges.map((edge) => {
                return {
                    source: edge[0],
                    target: edge[1],
                    weight: 1
                };
            });
            function blockNodeCoordinates(node: egoNetworkNetworkNode) {
                // This code is for keeping the nodes within the svg canvas.
                // The size of the nodes is scaled using a d3 scale function.
                //The blockX and blockY variables are used to set the boundaries of the nodes.
                //The node.x and node.y variables are set to be within the bounds of the svg canvas.

                const radius = Math.sqrt(3 / Math.PI);
                const blockX = 500 - 2 * radius;
                const blockY = 290 - 2 * radius;

                node.x = Math.max(radius, Math.min(blockX, node.x));
                node.y = Math.max(radius, Math.min(blockY, node.y));
                //return node;
            }
            function boxingForce() {
                outNodes.forEach((node) => {
                    //node = blockNodeCoordinates(scaleSize, node, svgSize);
                    blockNodeCoordinates(node);
                });
            }
            d3.forceSimulation(outNodes)
                .force('center', d3.forceCenter(0, 0))
                .force(
                    'charge',
                    d3.forceManyBody().strength(() => -5)
                )
                .force(
                    'link',
                    d3
                        .forceLink(outEdges)
                        .id((d: egoNetworkNetworkNode) => d.id)
                        .distance((d) => 1)
                )
                .force(
                    'collision',
                    d3
                        .forceCollide()
                        .radius((d: egoNetworkNetworkNode) => d.size + 1)
                )
                //.force('boxing', boxingForce)
                .stop()
                .tick(100);
            // make object with key as node id and value as node object
            const nodeDict = {};
            outNodes.forEach((node) => {
                nodeDict[node.id] = node;
            });
            set(nodeAtom, nodeDict);
            // make object with key as edge id and value as edge object
            const edgeDict = {};
            outEdges.forEach((edge) => {
                edgeDict[edge.source.id + edge.target.id] = edge;
            });

            set(linkAtom, edgeDict);
        })
        .catch((error) => {
            console.error(error);
        });
});

export let startDataOverview;
