import { useAtom } from 'jotai';
import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    opacity: number;
    color: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { weight, x1, x2, y1, y2, color, opacity } = props;
    const [highlightNode] = useAtom(highlightNodeAtom);
    return (
        <line
            opacity={opacity}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={weight * 10}
        />
    );
};

export default EgoNetworkNetworkEdge;
