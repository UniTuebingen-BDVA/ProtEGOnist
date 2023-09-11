// import { useAtom } from 'jotai';
// import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';
import { Graphics } from '@pixi/react';

import { memo, useCallback } from 'react';

interface EgoNetworkNetworkEdgeProps {
    weight: number;
    opacity: number;
    color: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = memo(function EgoNetworkNetworkEdge(
    props: EgoNetworkNetworkEdgeProps
) {
    const { weight, x1, x2, y1, y2, color, opacity } = props;
    // const [highlightNode] = useAtom(highlightNodeAtom);
    const draw = useCallback(
        (g) => {
            g.clear();
            g.lineStyle(weight * 10, color, opacity);
            g.moveTo(x1, y1);
            g.lineTo(x2, y2);
        },
        [color, opacity, weight, x1, x2, y1, y2]
    );
    return <Graphics draw={draw} />;
});

export default EgoNetworkNetworkEdge;
