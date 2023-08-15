import { useAtom } from 'jotai';
import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    source: string;
    target: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { weight, x1, x2, y1, y2, source, target } = props;
    const [highlightNode] = useAtom(highlightNodeAtom);

    const color =
        highlightNode === source || highlightNode === target
            ? '#ff0000'
            : '#000000';
    const opacity =
        highlightNode === source || highlightNode === target ? 1 : weight;
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
