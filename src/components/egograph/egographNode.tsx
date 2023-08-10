import { PrimitiveAtom, useAtom } from 'jotai';
import { layoutNode } from './egolayout';
import { Tooltip } from '@mui/material';

type egographNodeProps = {
    nodeAtom: PrimitiveAtom<layoutNode>;
    highlightedNodeIndicesAtom:PrimitiveAtom<number[]>
    centerPoint: { x: number; y: number };
    nodeRadius: number;
    fill: string;
};
export const EgographNode = (props: egographNodeProps) => {
    const { nodeAtom, highlightedNodeIndicesAtom, centerPoint, nodeRadius, fill } = props;
    const [node, setNode] = useAtom(nodeAtom);
    const [highlightedNodeIndices, setHighlightedNodeIndices] = useAtom(highlightedNodeIndicesAtom);
    return (
        <Tooltip title={`Name ${node.originalID},  Num edges ${node.numEdges}`}>
            <circle
                onMouseEnter={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: true }));
                    setHighlightedNodeIndices(node.identityNodes);
                }}
                onMouseLeave={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: false }));
                    setHighlightedNodeIndices([])
                }}
                cx={centerPoint.x}
                cy={centerPoint.y}
                r={nodeRadius}
                fill={fill}
                stroke={highlightedNodeIndices.includes(node.index)?"black":"none"}
            />
        </Tooltip>
    );
};
