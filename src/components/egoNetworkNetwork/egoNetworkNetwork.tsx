import { useAtom } from 'jotai';
import { aggregateNetworkAtom, interEdgesAtom } from './egoNetworkNetworkStore';
import EgoNetworkNetworkNode from './egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from './egoNetworkNetworkEdge.tsx';
import EgoGraphBundle from '../egograph/egoGraphBundle.tsx';
import { animated, useTransition } from '@react-spring/web';
import { egoGraphBundlesLayoutAtom } from '../egograph/egoGraphBundleStore.ts';

const EgoNetworkNetwork = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [interEdges] = useAtom(interEdgesAtom);
    const [layouts] = useAtom(egoGraphBundlesLayoutAtom);
    const transitionsNodes = useTransition(nodes, {
        keys: ({ id }) => id,
        from: {
            opacity: 1,
            transform: `translate(${0},${0})`
        },
        enter:
            ({ x, y }, _index) =>
            async (next, _cancel) => {
                await next({
                    transform: `translate(${x},${y})`,
                    delay: 100
                });
            },
        leave: () => async (next, _cancel) => {
            await next({
                opacity: 0,
                transform: `translate(${0},${0})`
            });
        },
        update:
            ({ x, y }, _index) =>
            async (next, _cancel) => {
                await next({
                    transform: `translate(${x},${y})`,
                    delay: 100
                });
            },
        config: (_item, _state, phase) => {
            switch (phase) {
                case 'leave':
                    return { duration: 100 };
                case 'update':
                    return { duration: 1000 };
                case 'enter':
                    return { duration: 1000 };
            }
        }
    });

    //animate the interEdges
    const edgesTransition = useTransition([...interEdges, ...edges], {
        keys: ({ source, target }) => source + '+' + target,
        from: ({ x1, x2, y1, y2 }) => ({
            x1: x1,
            x2: x2,
            y1: y1,
            y2: y2,
            opacity: 0
        }),
        leave:
            ({ x1, x2, y1, y2 }) =>
            async (next, _cancel) => {
                await next({
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    opacity: 0
                });
            },
        enter:
            ({ x1, x2, y1, y2 }) =>
            async (next, _cancel) => {
                await next({
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    opacity: 0.5,
                    delay: 1150
                });
            },
        update:
            ({ x1, x2, y1, y2 }) =>
            async (next, _cancel) => {
                await next({
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    opacity: 0.5,
                    delay: 100
                });
            },
        config: (_item, _state, phase) => {
            switch (phase) {
                case 'leave':
                    return { duration: 100 };
                case 'update':
                    return { duration: 1000 };
                case 'enter':
                    return { duration: 50 };
            }
        }
    });

    const otherEdges = edgesTransition((style, edge) => {
        return (
            <EgoNetworkNetworkEdge
                key={edge.source + '_' + edge.target}
                stroke="black"
                weight={edge.weight}
                // FIXME Edge misses opacity
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                animatedParams={style}
                notAnimatedParams={{
                    x1: edge.x1,
                    x2: edge.x2,
                    y1: edge.y1,
                    y2: edge.y2
                }}
                nodeIds={[edge.source, edge.target]}
            />
        );
    });
    return (
        <g>
            {otherEdges}
            {transitionsNodes((style, node) => {
                if (!node.collapsed) {
                    return (
                        <animated.g transform={style.transform}>
                            {/*TODO: Not sure why this check is needed, we
                            should fix this eventually!*/}
                            {Object.keys(layouts).includes(node.id) ? (
                                <EgoGraphBundle
                                    key={node.id}
                                    x={-node.radius / 2}
                                    y={-node.radius / 2}
                                    nodeId={node.id}
                                />
                            ) : null}
                        </animated.g>
                    );
                } else
                    return (
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={node.radius}
                            density={node.density}
                            animatedParams={style}
                        />
                    );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;
