export type baseNode = {
    id: string;
    originalID:string;
    name: string;
};

export type egoGraphNode = baseNode & {
    centerDist: number;
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
    x: number;
    y: number;
    color: string;
};

export type egoNetworkNetworkEdge = egoGraphEdge & {
    weight: number;
};

export type egoNetworkNetwork = {
    nodes: egoNetworkNetworkNode[];
    edges: egoNetworkNetworkEdge[];
};
