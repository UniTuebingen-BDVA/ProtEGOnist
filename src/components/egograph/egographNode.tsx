import { PrimitiveAtom, useAtom } from 'jotai';
import { layoutNode } from './egolayout';
import { memo } from 'react';
import {
    addAngle,
    cartesianToPolar,
    globalToLocal,
    localToGlobal,
    polarToCartesian,
    subtractAngle
} from './polarUtilities';
import { useSetAtom } from 'jotai';
import { decollapseNodeAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { hoverAtom } from '../utilityComponents/hoverStore.ts';

type egographNodeProps = {
    nodeAtom: PrimitiveAtom<layoutNode>;
    centerPoint: { x: number; y: number };
    nodeRadius: number;
    egoRadius: number;
    fill: string;
    centerNode: { x: number; y: number; id: string; outerSize: number };
};
export const EgographNode = memo(function EgographNode(
    props: egographNodeProps
) {
    const {
        nodeAtom,
        centerPoint,
        nodeRadius,
        fill,
        egoRadius,
        centerNode
    } = props;
    const [node, _setNode] = useAtom(nodeAtom);
    const [hoveredNode, setHoveredNode] = useAtom(hoverAtom);
    const setDecollapseID = useSetAtom(decollapseNodeAtom);
    const BOX_HEIGHT = egoRadius / 3;
    const centerPolarOuter = cartesianToPolar(
        globalToLocal([centerPoint.x, centerPoint.y], centerNode)
    );
    const centerPolarInner = {
        r: centerPolarOuter.r - BOX_HEIGHT,
        theta: centerPolarOuter.theta
    };
    const widthOfNodeRad =
        (2 * Math.PI) / ((egoRadius * 2 * Math.PI) / (nodeRadius * 0.95));
    const p1Polar = {
        r: centerPolarOuter.r,
        theta: subtractAngle(centerPolarOuter.theta, widthOfNodeRad)
    };
    const p2Polar = {
        r: centerPolarOuter.r,
        theta: addAngle(centerPolarInner.theta, widthOfNodeRad)
    };
    const p3Polar = {
        r: centerPolarInner.r,
        theta: addAngle(centerPolarInner.theta, widthOfNodeRad)
    };
    const p4Polar = {
        r: centerPolarInner.r,
        theta: subtractAngle(centerPolarOuter.theta, widthOfNodeRad)
    };
    const p1Cartesian = localToGlobal(
        polarToCartesian(p1Polar.r, p1Polar.theta),
        centerNode
    );
    const p2Cartesian = localToGlobal(
        polarToCartesian(p2Polar.r, p2Polar.theta),
        centerNode
    );
    const p3Cartesian = localToGlobal(
        polarToCartesian(p3Polar.r, p3Polar.theta),
        centerNode
    );
    const p4Cartesian = localToGlobal(
        polarToCartesian(p4Polar.r, p4Polar.theta),
        centerNode
    );
    return (
        <>
            {node.originalID == centerNode.id ? (
                <circle
                    onMouseEnter={() => {
                        setHoveredNode(node.originalID);
                    }}
                    onMouseLeave={() => {
                        setHoveredNode('');
                    }}
                    onDoubleClick={() => setDecollapseID(node.originalID)}
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={egoRadius / 10}
                    fill={fill}
                    stroke={
                        node.originalID===hoveredNode
                            ? 'black'
                            : 'none'
                    }
                />
            ) : (
                <path
                    onMouseEnter={() => {
                        setHoveredNode(node.originalID);
                    }}
                    onMouseLeave={() => {
                        setHoveredNode('');
                    }}
                    onDoubleClick={() => setDecollapseID(centerNode.id)}
                    d={`
          M ${p1Cartesian[0]} ${p1Cartesian[1]}
          A ${egoRadius} ${egoRadius} 0 0 1 ${p2Cartesian[0]} ${p2Cartesian[1]}
          L ${p3Cartesian[0]} ${p3Cartesian[1]}
            A ${BOX_HEIGHT} ${BOX_HEIGHT} 0 0 1 ${p4Cartesian[0]} ${p4Cartesian[1]}
            Z
        `}
                    fill={fill}
                    stroke={
                        node.originalID===hoveredNode
                            ? 'black'
                            : 'none'
                    }
                >
                    <title>{node.originalID}</title>
                </path>
            )}
        </>
    );
});
