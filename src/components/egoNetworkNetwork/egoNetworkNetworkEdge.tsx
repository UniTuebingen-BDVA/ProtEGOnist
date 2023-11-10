import { animated, SpringValue } from '@react-spring/web';
import { memo } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import {
    decollapsedSizeAtom,
    decollapseEdgeAtom,
    highlightedEdgesAtom
} from './egoNetworkNetworkStore.ts';
import * as d3 from 'd3';

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
    const [decollapsedSize] = useAtom(decollapsedSizeAtom);
    //find max value in the decollapsedSize dictionary
    const maxDecollapsed: number = d3.max(Object.values(decollapsedSize));
    const maxRadius: number =
        maxDecollapsed === undefined ? 150 : maxDecollapsed;
    // scale the weight such that the edges scale with the node size which is scaled
    //[ Math.PI * (maxDecollapsed / 30) ** 2,Math.PI * (maxDecollapsed / 3) ** 2]

    const weightInternal = weight * (maxRadius / 150);
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
                strokeWidth={0.5 + 2 * weightInternal * 30}
            />
            <line
                x1={notAnimatedParams.x1}
                y1={notAnimatedParams.y1}
                x2={notAnimatedParams.x2}
                y2={notAnimatedParams.y2}
                stroke="transparent"
                strokeWidth={
                    0.5 + 2 * weightInternal * 30 > 5
                        ? 0.5 + 2 * weightInternal * 30
                        : 5
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
