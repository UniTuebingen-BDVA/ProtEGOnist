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
import { connect } from 'http2';

export const serverBusyAtom = atom(false);
export const showOnTooltipAtom = atom([]);
export const nameNodesByAtom = atom('nodeID');
export const quantifyNodesByAtom = atom({});
export const classifyByAtom = atom('');
export const chosenSetAtom = atom(null);
export const edgesClassificationAtom = atom<{ [key: string]: number } | null>(
    null
);
export const uploadingDataAtom = atom(false);
export const uploadStatus = atom(
    (_get) => {},
    (get, set) => {
        let example = get(uploadingDataAtom);
        set(uploadingDataAtom, !example);
    }
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
export const detailNodeLinkBusyAtom = atom(false);
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

// response type for getNodeLinkFromSelectionAtom
type resultNodeLink = { nodes: string[]; edges: string[] }[];
type node = { id: string; size: number; x: number; y: number };
type edge = { source: node; target: node; weight: number };

function processNodesAndLinks(
    nodes: string[],
    links: string[][],
    center: [number, number],
    component: number
): {
    nodes: node[];
    edges: edge[];
} {
    const outNodes = nodes.map((node) => {
        return {
            id: node,
            component: component,
            size: 2,
            x: Math.random(),
            y: Math.random()
        };
    });
    const outEdges = links.map((edge) => {
        return {
            source: edge[0],
            target: edge[1],
            weight: 1
        };
    });
    function blockNodeCoordinates(node: node) {
        // This code is for keeping the nodes within the svg canvas.
        // The size of the nodes is scaled using a d3 scale function.
        //The blockX and blockY variables are used to set the boundaries of the nodes.
        //The node.x and node.y variables are set to be within the bounds of the svg canvas.

        const radius = Math.sqrt(3 / Math.PI);
        const blockX = 500 - 2 * radius;
        const blockY = 200 - 2 * radius;

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
        .force('center', d3.forceCenter(...center))
        .force(
            'charge',
            d3.forceManyBody().strength(() => -5)
        )
        .force(
            'link',
            d3
                .forceLink(outEdges)
                .id((d: node) => d.id)
                .distance(2)
                .strength(0.1)
        )
        .force(
            'collision',
            d3.forceCollide().radius((d: node) => d.size + 2)
        )
        .stop()
        .tick(100)
        .force('boxing', boxingForce);
    // .tick(5)
    // .stop();
    return { outNodes, outEdges };
}

export const getNodeLinkFromSelectionAtom = atom(null, (get, set) => {
    set(detailNodeLinkBusyAtom, true);
    const selectedNodesIds = get(selectedNodesAtom);
    const payload = {
        ids: selectedNodesIds,
        example: get(selectedExampleAtom)
    };
    axios
        .post<resultNodeLink>('/api/getNodeLinkDiagram/', payload)
        .then((result) => {
            console.log(result);
            const components: resultNodeLink = result.data;
            const largestComponent = components[0];

            const { outNodes, outEdges } = processNodesAndLinks(
                largestComponent.nodes,
                largestComponent.edges,
                [500, 200],
                0
            );
            // make object with key as node id and value as node object
            const nodeDict = {};
            let min_x = Infinity;
            let max_y = -Infinity;
            outNodes.forEach((node) => {
                min_x = Math.min(min_x, node.x);
                max_y = Math.max(max_y, node.y);
                nodeDict[node.id] = node;
            });
            // make object with key as edge id and value as edge object
            const edgeDict = {};
            outEdges.forEach((edge) => {
                edgeDict[edge.source.id + edge.target.id] = edge;
            });
            const nodes = [nodeDict];
            const edges = [edgeDict];
            if (components.length > 1) {
                let xOffset = 0;
                for (let i = 1; i < components.length; i++) {
                    const { outNodes, outEdges } = processNodesAndLinks(
                        components[i].nodes,
                        components[i].edges,
                        [min_x, max_y + 10],
                        i
                    );
                    xOffset += outNodes.length * 2;
                    const nodeDictComp = {};
                    outNodes.forEach((node) => {
                        nodeDictComp[node.id] = node;
                    });
                    const edgeDictComp = {};
                    outEdges.forEach((edge) => {
                        edgeDictComp[edge.source.id + edge.target.id] = edge;
                    });
                    nodes.push(nodeDictComp);
                    edges.push(edgeDictComp);
                }
            }
            set(detailNodeLinkBusyAtom, false);
            set(nodeAtom, nodes);
            set(linkAtom, edges);
        })
        .catch((error) => {
            console.error(error);
        });
});

export let startDataOverview;
