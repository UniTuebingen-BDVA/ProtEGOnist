import { useTransition } from '@react-spring/web';
import DetailNode from './detailNode';

/**
 * Props for the DetailNodes component.
 */
interface DetailNodesProps {
    nodes: {
        id: string;
        x: number;
        y: number;
        fill: string;
        size: number;
    }[];
}

/**
 * Renders the detail nodes component.
 * @param props - The component props.
 * @returns The rendered detail nodes component.
 */
const DetailNodes = (props: DetailNodesProps) => {
    const transitions = useTransition(props.nodes, {
        keys: (node) => node.id,
        from: (node) => ({
            cx: node.x,
            cy: node.y,
            opacity: 1
        }),
        leave: () => async (next, _cancel) => {
            await next({
                opacity: 1
            });
        },
        update: (node) => async (next, _cancel) => {
            await next({
                cx: node.x,
                cy: node.y,
                opacity: 1
            });
        }
    });
    return (
        <>
            {transitions((style, node) => (
                <DetailNode
                    key={node.id}
                    id={node.id}
                    size={node.size}
                    styleParam={style}
                />
            ))}
        </>
    );
};

export default DetailNodes;
