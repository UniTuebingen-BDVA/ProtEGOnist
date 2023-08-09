import { useAtom } from 'jotai';
import { aggregateNetworkAtom } from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import EgoGraphBundle from '../egograph/egoGraphBundle.tsx';
import { bundleGroupSizeAtom } from '../egograph/egoGraphBundleStore.ts';
import { useTransition } from '@react-spring/web';

const EgoNetworkNetwork = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [bundleGroupSize] = useAtom(bundleGroupSizeAtom);

    const transitionsNodes = useTransition(nodes, {
        keys: ({ id }) => id,
        from: {
            x: 0,
            y: 0,
            opacity: 1
        },
        enter:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
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

    return (
        <g>
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
                    //console.log(node);
                    return (
                        <EgoGraphBundle
                            x={style.x - bundleGroupSize.width / 2}
                            y={style.y - bundleGroupSize.height / 2}
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
