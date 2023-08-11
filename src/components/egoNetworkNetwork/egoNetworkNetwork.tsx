import { useAtom } from 'jotai';
import {
    aggregateNetworkAtom,
    decollapsedSizeAtom,
    interEdgesAtom
} from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import EgoGraphBundle from '../egograph/egoGraphBundle.tsx';
import { animated, useTransition } from '@react-spring/web';

const EgoNetworkNetwork = () => {
    const [{ nodes, edges }] =
        useAtom(aggregateNetworkAtom);

    const [decollapsedSize] = useAtom(decollapsedSizeAtom);
    const [interEdges] = useAtom(interEdgesAtom);
    const transitionsNodes = useTransition(nodes, {
        keys: ({ id }) => id,
        from: {
            x: 100,
            y: 100,
            opacity: 1,
            transform: `translate(${0},${0})`
        },
        enter:
            ({ x, y, id }, index) =>
            async (next, cancel) => {
                await next({
                    x: x,
                    y: y,
                    transform: `translate(${
                        x - decollapsedSize[id.split(',').length - 1] / 2
                    },${y - decollapsedSize[id.split(',').length - 1] / 2})`
                });
            },
        leave: () => async (next, cancel) => {
            await next({
                opacity: 0,
                transform: `translate(${0},${0})`
            });
        },
        update:
            ({ x, y, id }, index) =>
            async (next, cancel) => {
                await next({
                    x: x,
                    y: y,
                    transform: `translate(${
                        x - decollapsedSize[id.split(',').length - 1] / 2
                    },${y - decollapsedSize[id.split(',').length - 1] / 2})`
                });
            },
        config: { duration: 2000 }
    });
    const transitionsEdges = useTransition(edges, {
        keys: ({ source, target }) => source.id + '+' + target.id,
        from: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            opacity: 1
        },
        enter:
            ({ source, target }, index) =>
            async (next, cancel) => {
                const sourceNode = nodes.find((node) => node.id === source.id);

                const targetNode = nodes.find((node) => node.id === target.id);
                await next({
                    x1: sourceNode?.x,
                    y1: sourceNode?.y,
                    x2: targetNode?.x,
                    y2: targetNode?.y,
                    opacity: 1
                });
            },
        leave: () => async (next, cancel) => {
            await next({
                opacity: 0
            });
        },
        update:
            ({ source, target }, index) =>
            async (next, cancel) => {
                const sourceNode = nodes.find((node) => node.id === source.id);

                const targetNode = nodes.find((node) => node.id === target.id);
                await next({
                    x1: sourceNode?.x,
                    y1: sourceNode?.y,
                    x2: targetNode?.x,
                    y2: targetNode?.y
                });
            },
        config: { duration: 2000 }
    });

    //animate the interEdges
    const interEdgesTransition = useTransition(interEdges, {
        keys: ({ source, target }) => source + '+' + target,
        from: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            opacity: 1
        },
        enter:
            ({ x1, x2, y1, y2 }, index) =>
            async (next, cancel) => {
                await next({
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    opacity: 1
                });
            },
        leave: () => async (next, cancel) => {
            await next({
                opacity: 0
            });
        },
        update:
            ({ x1, x2, y1, y2 }, index) =>
            async (next, cancel) => {
                await next({
                    x1: x1,
                    y1: y1,
                    x2: x2,
                    y2: y2,
                    opacity: 1
                });
            },
        config: { duration: 2000 }
    });

    const otherEdges = interEdgesTransition((style, edge) => {
        return (
            <animated.line
                key={edge.source+"_"+edge.target}
                x1={style.x1}
                y1={style.y1}
                x2={style.x2}
                y2={style.y2}
                stroke="black"
                strokeWidth={edge.weight * 20}
            />
        );
    });
    return (
        <g>
            {otherEdges}
            {transitionsEdges((style, edge) => {
                return (
                    <EgoNetworkNetworkEdge
                        key={edge.source.id + '+' + edge.target.id}
                        weight={edge.weight}
                        animatedParams={style}
                    />
                );
            })}

            {transitionsNodes((style, node) => {
                if (!node.collapsed) {
                    return (
                        <EgoGraphBundle
                            x={
                                style.x.get() -
                                decollapsedSize[node.id.split(',').length - 1] /
                                    2
                            }
                            y={
                                style.y.get() -
                                decollapsedSize[node.id.split(',').length - 1] /
                                    2
                            }
                            nodeId={node.id}
                            transform={style.transform}
                        />
                    );
                } else
                    return (
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={node.size}
                            color={'red'}
                            animatedParams={style}
                        />
                    );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;
