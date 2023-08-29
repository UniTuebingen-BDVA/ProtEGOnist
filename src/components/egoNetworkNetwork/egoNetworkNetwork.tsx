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
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);
    const [decollapsedSize] = useAtom(decollapsedSizeAtom);
    const [interEdges] = useAtom(interEdgesAtom);

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
                    transform: `translate(${x},${y})`
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
                    transform: `translate(${x},${y})`
                });
            },
        config: { duration: 1200 }
    });

    //animate the interEdges
    const edgesTransition = useTransition([...interEdges, ...edges], {
        keys: ({ source, target }) => source + '+' + target,
        from:  ({ x1, x2, y1, y2 }) => ({
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
            opacity: 0 }),
        enter:
            ({ x1, x2, y1, y2 }) =>
            async (next, _cancel) => {
                await next({
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    opacity: 1
                });
            },
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
        update:
            ({ x1, x2, y1, y2 }) =>
            async (next, _cancel) => {
                await next({
                    x1: x1,
                    x2: x2,
                    y1: y1,
                    y2: y2,
                    opacity: 1
                });
            },
        config: (_item, _state, phase) => {
            switch (phase) {
                case 'leave':
                    return { duration: 100 };
                case 'update':
                    return { duration: 1200 };
                case 'enter':
                    return { duration: 1200 };
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
                            <EgoGraphBundle
                                x={
                                    -decollapsedSize[
                                        node.id.split(',').length - 1
                                    ] / 2
                                }
                                y={
                                    -decollapsedSize[
                                        node.id.split(',').length - 1
                                    ] / 2
                                }
                                nodeId={node.id}
                            />
                        </animated.g>
                    );
                } else
                    return (
                        // FIXME Node misses x,y
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore ts2304
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={node.radius}
                            //color={'#ff7f00'}
                            animatedParams={style}
                        />
                    );
            })}
        </g>
    );
};

export default EgoNetworkNetwork;
