import { animated } from '@react-spring/web';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    animatedParams: {
        opacity: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { weight, animatedParams } = props;
    return (
        <animated.line
            opacity={animatedParams.opacity}
            x1={animatedParams.x1}
            y1={animatedParams.y1}
            x2={animatedParams.x2}
            y2={animatedParams.y2}
            stroke="black"
            opacity={weight}
            strokeWidth={weight * 20}
        />
    );
};

export default EgoNetworkNetworkEdge;
