import { egoGraph, egoGraphNode } from '../../egoGraphSchema.ts';

type NodeDict = {
    [key: string]: egoGraphNode;
};

export function sectionEgoGraphs(
    egoGraphs: egoGraph[],
    intersections: { [key: string]: { ids: string[]; nodes: string[] } },
    numLayers: number
) {
    const nodeDict = createNodeDict(egoGraphs);
    const egoIds = egoGraphs.map((d) => d.centerNode.originalID);
    egoGraphs.forEach((egoGraph) => {
        egoGraph.sections = createSections(
            egoGraph,
            intersections,
            nodeDict,
            numLayers,
            egoIds.filter((d) => egoGraph.centerNode.originalID !== d)
        );
    });
}

function findIdentityNodes(id: string, nodes: egoGraphNode[]) {
    return nodes.reduce((acc: string[], node) => {
        if (node.originalID === id) acc.push(node.id);
        return acc;
    }, []);
}

function createNodeDict(egoGraphs: egoGraph[]) {
    const nodeDict: NodeDict = {};
    egoGraphs.forEach((egoGraph) => {
        egoGraph.nodes.forEach((node) => {
            node.isCenter = false;
            node.cx = 0;
            node.cy = 0;
            node.pseudo = false;
            node.identityNodeKeys = findIdentityNodes(
                node.originalID,
                egoGraphs.map((d) => d.nodes).flat()
            );
            node.identityNodes=[];
            nodeDict[node.id] = node;
        });
    });
    return nodeDict;
}

function createSections(
    egoGraph: egoGraph,
    intersections: { [key: string]: { ids: string[]; nodes: string[] } },
    nodeDict: NodeDict,
    numLayers: number,
    otherGraphIds: string[]
) {
    const sections: { ids: string[]; nodes: string[][][] }[] = [];
    Object.values(intersections).forEach((intersection) => {
        if (intersection.ids.includes(egoGraph.centerNode.originalID)) {
            sections.push({
                ids: intersection.ids,
                nodes: createLayers(
                    intersection.nodes,
                    nodeDict,
                    numLayers,
                    egoGraph.centerNode.originalID,
                    otherGraphIds
                )
            });
        }
    });
    return sections;
}

function createLayers(
    nodeIds: string[],
    nodeDict: NodeDict,
    numLayers: number,
    currGraphId: string,
    otherGraphIds: string[]
) {
    const layers: string[][] = new Array(numLayers + 1)
        .fill(null)
        .map(() => new Array<string>(0));
    nodeIds.forEach((nodeId) => {
        layers[nodeDict[currGraphId + '_' + nodeId].centerDist].push(nodeId);
    });
    return layers.map((layer) =>
        createSlices(layer, currGraphId, otherGraphIds, nodeDict)
    );
}

function createSlices(
    nodes: string[],
    currGraphId: string,
    otherGraphIds: string[],
    nodeDict: NodeDict
) {
    const slices: { [key: number]: string[] } = {};
    nodes.forEach((node) => {
        const egoDist = nodeDict[currGraphId + '_' + node].centerDist;
        const otherDistances = otherGraphIds
            .filter((id) => Object.keys(nodeDict).includes(id + '_' + node))
            .map((id) => nodeDict[id + '_' + node].centerDist);
        const summedDist =
            egoDist +
            otherDistances.reduce((val: number, acc: number) => val + acc, 0);
        if (!Object.keys(slices).includes(String(summedDist))) {
            slices[summedDist] = [];
        }
        slices[summedDist].push(`${currGraphId}_${node}`);
    });
    const entries = Object.entries(slices);
    entries.sort((a, b) => Number(b) - Number(a));
    return entries.map((d) => sortSlice(d[1], nodeDict));
}

function sortSlice(
    nodes: string[],
    nodeDict: { [key: string]: egoGraphNode },
    comparatorKey: string = 'numEdges'
) {
    return nodes.sort(
        (a, b) => nodeDict[a][comparatorKey] - nodeDict[b][comparatorKey]
    );
}
