import { PrimitiveAtom, useAtom } from 'jotai';
import { layoutNode } from './egolayout';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';
import { memo } from 'react';

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
    return (
        <AdvancedTooltip
            uniprotID={node.originalID}
            additionalData={`Num edges ${node.numEdges}`}
        >
            <circle
                onMouseEnter={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: true }));
                    setHighlightedNodeIndices(node.identityNodes);
                }}
                onMouseLeave={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: false }));
                    setHighlightedNodeIndices([]);
                }}
                cx={centerPoint.x}
                cy={centerPoint.y}
                r={2.5}
                fill={fill}
                stroke={
                    highlightedNodeIndices.includes(node.index)
                        ? 'black'
                        : 'none'
                }
            />
        </AdvancedTooltip>
    );
});
