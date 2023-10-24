import { animated, SpringValue } from '@react-spring/web';
import { memo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
    decollapseEdgeAtom,
    highlightedEdgesAtom
} from './egoNetworkNetworkStore.ts';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    animatedParams: {
        opacity: SpringValue<number>;
        x1: SpringValue;
        y1: SpringValue;
        x2: SpringValue;
        y2: SpringValue;
    };
    notAnimatedParams: {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
    };
    nodeIds: string[];
}

const EgoNetworkNetworkEdge = memo(function EgoNetworkNetworkEdge(
    props: EgoNetworkNetworkEdgeProps
) {
    const { weight, animatedParams, notAnimatedParams, nodeIds } = props;
    const setDecollapseEdge = useSetAtom(decollapseEdgeAtom);
    const [highlightedEdges, setHighlightedEdges] =
        useAtom(highlightedEdgesAtom);
    return (
        <g>
            <animated.line
                opacity={animatedParams.opacity}
                x1={animatedParams.x1}
                y1={animatedParams.y1}
                x2={animatedParams.x2}
                y2={animatedParams.y2}
                stroke={
                    highlightedEdges.ids.includes(nodeIds[0]) &&
                    highlightedEdges.ids.includes(nodeIds[1])
                        ? 'black'
                        : 'lightgray'
                }
                strokeWidth={0.5 + 2 * weight * 30}
            />
            <line
                x1={notAnimatedParams.x1}
                y1={notAnimatedParams.y1}
                x2={notAnimatedParams.x2}
                y2={notAnimatedParams.y2}
                stroke="transparent"
                strokeWidth={
                    0.5 + 2 * weight * 30 > 5 ? 0.5 + 2 * weight * 30 : 5
                }
                style={
                    highlightedEdges.ids.includes(nodeIds[0]) &&
                    highlightedEdges.ids.includes(nodeIds[1])
                        ? { cursor: 'pointer' }
                        : { cursor: 'inherit' }
                }
                onClick={() => {
                    setDecollapseEdge();
                }}
                onMouseEnter={() => {
                    setHighlightedEdges(nodeIds);
                }}
                onMouseLeave={() => setHighlightedEdges([])}
            />
        </g>
    );
});

export default EgoNetworkNetworkEdge;
