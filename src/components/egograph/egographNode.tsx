import { PrimitiveAtom, useAtom } from 'jotai';
import { layoutNode } from './egolayout';
import { Tooltip } from '@mui/material';

type egographNodeProps = {
    nodeAtom: PrimitiveAtom<layoutNode>;
    centerPoint: { x: number; y: number };
    nodeRadius: number;
    fill: string;
};
export const EgographNode = (props: egographNodeProps) => {
    const { nodeAtom, centerPoint, nodeRadius, fill } = props;
    const [node, setNode] = useAtom(nodeAtom);
    return (
        <Tooltip title={`Name ${node.originalID},  Num edges ${node.numEdges}`}>
            <circle
                onMouseEnter={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: true }));
                }}
                onMouseLeave={() => {
                    setNode((oldValue) => ({ ...oldValue, hovered: false }));
                }}
                cx={centerPoint.x}
                cy={centerPoint.y}
                r={nodeRadius}
                fill={fill}
            />
        </Tooltip>
    );
};
