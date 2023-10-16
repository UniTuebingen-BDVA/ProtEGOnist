import { animated } from '@react-spring/web';
import { memo } from 'react';

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

const EgoNetworkNetworkEdge = memo(function EgoNetworkNetworkEdge(
    props: EgoNetworkNetworkEdgeProps
) {
    const { weight, animatedParams } = props;
    return (
        <animated.line
            opacity={animatedParams.opacity}
            x1={animatedParams.x1}
            y1={animatedParams.y1}
            x2={animatedParams.x2}
            y2={animatedParams.y2}
            stroke="lightgray"
            strokeWidth={0.5 + 2 * weight * 30}
        />
    );
});

export default EgoNetworkNetworkEdge;
