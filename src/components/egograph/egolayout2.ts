import { egoGraph } from '../../egoGraphSchema.ts';
import { nodeRadius } from './egoGraphBundleStore.ts';
import { polarToCartesian } from '../../UtilityFunctions.ts';
import * as d3 from 'd3';

type graphCenter = {
    x: number;
    y: number;
    id: string;
    outerSize: number;
};
type position = {
    x: number;
    y: number;
};
type nodePositions = { [key: string]: position };

/**
 * Calculates the needed radius for the ego graph such that the nodes are not overlapping and evenly distributed
 */
function calculateEgoRadius(amount: number, minRadius: number) {
    const minCirc = 2 * Math.PI * minRadius;
    const circ = amount * nodeRadius > minCirc ? amount * nodeRadius : minCirc;
    return circ / (2 * Math.PI);
}

function calculateEgoRadii(
    egoGraphs: egoGraph[],
    intersections,
    minRadius: number,
    decollapseMode: string
) {
    const egoRadii: { [key: string]: number } = {};
    egoGraphs.forEach((egoGraph) => {
        egoRadii[egoGraph.centerNode.originalID] = calculateEgoRadius(
            decollapseMode === 'shared'
                ? egoGraphs.length === 1
                    ? egoGraph.nodes.length
                    : egoGraph.nodes.length -
                      intersections[egoGraph.centerNode.originalID].length
                : egoGraph.nodes.length,
            minRadius
        );
    });
    return egoRadii;
}

function calculateGroupLayout(
    egoGraphs: egoGraph[],
    intersections,
    minRadius: number,
    decollapseMode: string
) {
    const egoRadii = calculateEgoRadii(
        egoGraphs,
        intersections,
        minRadius,
        decollapseMode
    );
    // calculate center points for egobundles in the corresponding node of the force layout
    const maxRadius = Math.max(...Object.values(egoRadii));
    // set radius of the bundle such that all circles are accommodated
    const radiusOfEnclosingCircle =
        egoGraphs.length === 2 ? maxRadius * 2.7 : maxRadius * 3;
    const placementRadius = radiusOfEnclosingCircle - maxRadius * 1.2;
    const placementAngle = (2 * Math.PI) / egoGraphs.length;
    return {
        egoRadii,
        radiusOfEnclosingCircle,
        placementRadius,
        placementAngle
    };
}

function calculateNodePositions(
    layers: string[][][],
    numLayers: number,
    radius: number,
    angle: number,
    center: { x: number; y: number },
    rotation: number,
    isUnique: boolean
) {
    const positions: nodePositions = {};
    let scale;
    if (!isUnique) {
        const domain = layers.flat().flat();
        scale = d3.scaleBand<string>().range([0, angle]).domain(domain);
    }
    for (let i = 0; i < numLayers; i++) {
        if (isUnique) {
            const domain = layers[i].flat();
            scale = d3.scaleBand<string>().range([0, angle]).domain(domain);
        }
        layers[i].forEach((subsection) => {
            const layerRadius = (radius / numLayers) * i;
            subsection.forEach((node) => {
                positions[node] = polarToCartesian(
                    center.x,
                    center.y,
                    layerRadius,
                    scale(node),
                    rotation
                );
            });
        });
    }
    return positions;
}

function calculateSectionLayout(
    nodes: string[][][],
    nodeTotal: number,
    numLayers: number,
    egoRadius: number,
    center: { x: number; y: number },
    currRotation: number
) {
    const proportion = nodes.flat().flat().length / nodeTotal;
    const angle = proportion * Math.PI * 2;
    const nodePositions = calculateNodePositions(
        nodes,
        numLayers,
        egoRadius,
        angle,
        center,
        currRotation,
        false
    );
    const start = polarToCartesian(
        center.x,
        center.y,
        egoRadius,
        0,
        currRotation
    );
    const end = polarToCartesian(
        center.x,
        center.y,
        egoRadius,
        angle,
        currRotation
    );
    return { nodePositions, start, end, angle };
}

function calculateEgoLayout(
    sections: { ids: string[]; nodes: string[][][] }[],
    currID: string,
    prevID: string,
    nextID: string,
    decollapseMode: string,
    egoRadius: number,
    numLayers: number,
    rotation: number,
    center: { x: number; y: number }
) {
    let positions: nodePositions = {};
    const bands = {};
    let uniqueNodes: string[][][] = [];
    let nodeTotal: number;
    let currRotation = rotation;
    if (decollapseMode !== 'shared' || currID === prevID) {
        uniqueNodes = sections.filter(
            (section) => section.ids.length === 1 && section.ids[0] === currID
        )[0].nodes;
        nodeTotal = sections
            .map((d) => d.nodes)
            .flat()
            .flat().length;
        const uniqueLayout = calculateSectionLayout(
            uniqueNodes,
            nodeTotal,
            numLayers,
            egoRadius,
            center,
            currRotation
        );
        positions = { ...positions, ...uniqueLayout.nodePositions };
        currRotation += uniqueLayout.angle;
    } else {
        nodeTotal = sections
            .filter((d) => d.ids.length > 1)
            .map((d) => d.nodes)
            .flat()
            .flat().length;
    }
    if (prevID !== currID) {
        const prevNodes = sections.filter(
            (section) =>
                section.ids.includes(prevID) && section.ids.includes(currID)
        )[0].nodes;
        const prevLayout = calculateSectionLayout(
            prevNodes,
            nodeTotal,
            numLayers,
            egoRadius,
            center,
            currRotation
        );
        positions = { ...positions, ...prevLayout.nodePositions };
        currRotation += prevLayout.angle;
        if (prevID !== nextID) {
            const sharedAllNodes = sections.filter(
                (section) => section.ids.length === 3
            )[0].nodes;
            const allLayout = calculateSectionLayout(
                sharedAllNodes,
                nodeTotal,
                numLayers,
                egoRadius,
                center,
                currRotation
            );
            positions = { ...positions, ...allLayout.nodePositions };
            currRotation += allLayout.angle;
            const nextNodes = sections.filter(
                (section) =>
                    section.ids.includes(prevID) && section.ids.includes(currID)
            )[0].nodes;
            const nextLayout = calculateSectionLayout(
                nextNodes,
                nodeTotal,
                numLayers,
                egoRadius,
                center,
                currRotation
            );
            positions = { ...positions, ...nextLayout.nodePositions };
        }
    }
    return positions;
}

function iterateEgoGraphs(
    egoGraphs: egoGraph[],
    radiusOfEnclosingCircle: number,
    placementRadius: number,
    placementAngle: number,
    decollapseMode: string,
    egoRadii,
    numLayers: number
) {
    let layoutNodeDict = {};
    for (let i = 0; i < egoGraphs.length; i++) {
        const currId = egoGraphs[i].centerNode.originalID;
        let prevId: string;
        let nextId: string;
        if (i === 0) {
            prevId = egoGraphs[egoGraphs.length - 1].centerNode.originalID;
        } else {
            prevId = egoGraphs[i - 1].centerNode.originalID;
        }
        if (i === egoGraphs.length - 1) {
            nextId = egoGraphs[0].centerNode.originalID;
        } else {
            nextId = egoGraphs[i + 1].centerNode.originalID;
        }
        const center = polarToCartesian(
            radiusOfEnclosingCircle / 2,
            radiusOfEnclosingCircle / 2,
            placementRadius,
            i * placementAngle,
            Math.PI
        );
        layoutNodeDict = {
            ...layoutNodeDict,
            ...calculateEgoLayout(
                egoGraphs[i].sections,
                currId,
                prevId,
                nextId,
                decollapseMode,
                egoRadii[currId],
                numLayers,
                placementAngle * i,
                center
            )
        };
    }
    return layoutNodeDict;
}

export function calculateLayout2(
    egoGraphs: egoGraph[],
    intersections,
    decollapseMode: string,
    minRadius: number,
    numLayers: number
) {
    // sort egoGraphs by ID
    egoGraphs.sort((a, b) => {
        if (a.centerNode.originalID > b.centerNode.originalID) {
            return 1;
        } else if (a.centerNode.originalID < b.centerNode.originalID) {
            return -1;
        } else {
            return 0;
        }
    });
    const {
        egoRadii,
        radiusOfEnclosingCircle,
        placementRadius,
        placementAngle
    } = calculateGroupLayout(
        egoGraphs,
        intersections,
        minRadius,
        decollapseMode
    );

    console.log(
        iterateEgoGraphs(
            egoGraphs,
            radiusOfEnclosingCircle,
            placementRadius,
            placementAngle,
            decollapseMode,
            egoRadii,
            numLayers
        )
    );
}
