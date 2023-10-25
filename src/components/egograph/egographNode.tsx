import { PrimitiveAtom, useAtom } from 'jotai';
import { layoutNode } from './egolayout';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';
import { memo } from 'react';
import {
    addAngle,
    cartesianToPolar,
    globalToLocal,
    localToGlobal,
    polarToCartesian,
    subtractAngle
} from './polarUtilities';

type egographNodeProps = {
    nodeAtom: PrimitiveAtom<layoutNode>;
    highlightedNodeIndicesAtom: PrimitiveAtom<number[]>;
    centerPoint: { x: number; y: number };
    nodeRadius: number;
    egoRadius: number;
    fill: string;
    centerNode: { x: number; y: number };
};
export const EgographNode = memo(function EgographNode(
    props: egographNodeProps
) {
    const {
        nodeAtom,
        highlightedNodeIndicesAtom,
        centerPoint,
        nodeRadius,
        fill,
        egoRadius,
        centerNode
    } = props;
    const [node, setNode] = useAtom(nodeAtom);
    const [highlightedNodeIndices, setHighlightedNodeIndices] = useAtom(
        highlightedNodeIndicesAtom
    );
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
        <AdvancedTooltip
            nodeID={node.originalID}
            additionalData={`Num edges ${node.numEdges}`}
        >
            {centerPoint.x === centerNode.x &&
            centerNode.y === centerPoint.y ? (
                <circle
                    onMouseEnter={() => {
                        setNode((oldValue) => ({ ...oldValue, hovered: true }));
                        setHighlightedNodeIndices(node.identityNodes);
                    }}
                    onMouseLeave={() => {
                        setNode((oldValue) => ({
                            ...oldValue,
                            hovered: false
                        }));
                        setHighlightedNodeIndices([]);
                    }}
                    cx={centerPoint.x}
                    cy={centerPoint.y}
                    r={nodeRadius}
                    fill={fill}
                    stroke={
                        highlightedNodeIndices.includes(node.index)
                            ? 'black'
                            : 'none'
                    }
                />
            ) : (
                <path
                    onMouseEnter={() => {
                        setNode((oldValue) => ({ ...oldValue, hovered: true }));
                        setHighlightedNodeIndices(node.identityNodes);
                    }}
                    onMouseLeave={() => {
                        setNode((oldValue) => ({
                            ...oldValue,
                            hovered: false
                        }));
                        setHighlightedNodeIndices([]);
                    }}
                    d={`
          M ${p1Cartesian[0]} ${p1Cartesian[1]}
          A ${egoRadius} ${egoRadius} 0 0 1 ${p2Cartesian[0]} ${p2Cartesian[1]}
          L ${p3Cartesian[0]} ${p3Cartesian[1]}
            A ${BOX_HEIGHT} ${BOX_HEIGHT} 0 0 1 ${p4Cartesian[0]} ${p4Cartesian[1]}
            Z
        `}
                    fill={fill}
                    stroke={
                        highlightedNodeIndices.includes(node.index)
                            ? 'black'
                            : 'none'
                    }
                />
            )}
        </AdvancedTooltip>
    );
});
