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
    const [{ nodes, edges, bundleNetworkEdges }] =
        useAtom(aggregateNetworkAtom);

    const [decollapsedSize] = useAtom(decollapsedSizeAtom);
    const [interEdges] = useAtom(interEdgesAtom);
    const transitionsNodes = useTransition(nodes, {
        keys: ({ id }) => id,
        from: {
            transform: "translate(0,0)",
            x: 0,
            y: 0,
            opacity: 1
        },
        enter:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
                    transform: `translate(${x},${y})`,
                    x: x,
                    y: y
                });
            },
        leave: () => async (next, cancel) => {
            await next({
                opacity: 0
            });
        },
        update:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
                    transform: `translate(${x},${y})`,
                    x: x,
                    y: y
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
    const otherEdges = interEdges.map((edge) => {
        return (
            <line
                x1={edge.x1}
                y1={edge.y1}
                x2={edge.x2}
                y2={edge.y2}
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
