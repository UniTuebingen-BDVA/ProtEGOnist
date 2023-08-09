import { useAtom } from 'jotai';
import { aggregateNetworkAtom } from './egoNetworkNetworkOverviewStore';
import EgoNetworkNetworkNode from '../egoNetworkNetwork/egoNetworkNetworkNode.tsx';
import EgoNetworkNetworkEdge from '../egoNetworkNetwork/egoNetworkNetworkEdge.tsx';
import { useTransition } from '@react-spring/web';

const EgoNetworkNetwork = () => {
    const [{ nodes, edges }] = useAtom(aggregateNetworkAtom);

    const transitionsNodes = useTransition(nodes, {
        keys: ({ id }) => id,
        from: ({ x, y }, index) => ({
            x: 0,
            y: 0
        }),
        enter:
            ({ x, y }, index) =>
            async (next, cancel) => {
                await next({
                    x: x,
                    y: y
                });
            },
        leave:
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
        from: ({ source, target }, index) => {
            const sourceNode = nodes.find((node) => node.id === source.id);

            const targetNode = nodes.find((node) => node.id === target.id);
            return {
                x1: sourceNode?.x,
                y1: sourceNode?.y,
                x2: targetNode?.x,
                y2: targetNode?.y
            };
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
                    y2: targetNode?.y
                });
            },
        leave:
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
                        source={edge.source}
                        target={edge.target}
                        weight={edge.weight}
                        x1={style.x1}
                        y1={style.y1}
                        x2={style.x2}
                        y2={style.y2}
                    />
                );
            })}

            {transitionsNodes((style, node) => {
                    return (
                        <EgoNetworkNetworkNode
                            key={node.id}
                            id={node.id}
                            size={node.size}
                            x={style.x}
                            y={style.y}
                            color={'red'}
                        />
                    );
            })}
             
        </g>
    );
};

export default EgoNetworkNetwork;
