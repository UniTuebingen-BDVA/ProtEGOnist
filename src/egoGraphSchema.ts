export type egoGraphNode = {
  id: string;
  name: string;
};
export type egoGraphEdge = {
  source: number;
  target: number;
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
