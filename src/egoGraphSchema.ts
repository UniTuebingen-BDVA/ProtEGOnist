export type baseNode = {
    id: string;
    name: string;
};

export type egoGraphNode = baseNode & {
    centerDist: number;
    originalID: string;
    numEdges: number;
};

export type egoGraphEdge = {
    source: string;
    target: string;
};

export interface egoGraph {
    centerNode: egoGraphNode;
    nodes: egoGraphNode[];
    edges: egoGraphEdge[];
}

export type intersectionDatum = {
    intersection: (string | number)[];
    classification: string;
    setSize: number;
    jaccard: number;
    len1Proportion: number;
    len2Proportion: number;
    len3Proportion: number;
    len4Proportion: number;
};

export type egoNetworkNetworkNode = baseNode & {
    size: number;
    radius: number;
    x: number;
    y: number;
    collapsed: boolean;
};
export type egoNetworkNetworkEdge = {
    source: string;
    target: string;
    weight: number;
};
export type egoNetworkNetworkRenderedEdge = {
    source: egoNetworkNetworkNode;
    target: egoNetworkNetworkNode;
    weight: number;
};

export type egoNetworkNetwork = {
    nodes: egoNetworkNetworkNode[];
    edges: egoNetworkNetworkEdge[] | egoNetworkNetworkRenderedEdge[];
};
