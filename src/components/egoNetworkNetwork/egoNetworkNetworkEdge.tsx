import { animated } from '@react-spring/web';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { weight, x1, x2, y1, y2 } = props;
    return (
        <animated.line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="black"
            opacity={weight}
            strokeWidth={weight * 20}
        />
    );
};

export default EgoNetworkNetworkEdge;
