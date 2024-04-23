import { useTransition } from '@react-spring/web';
import DetailNode from './detailNode';

interface DetailNodesProps {
  nodes: {
    id: string;
    x: number;
    y: number;
    fill: string;
    size: number;
  }[];
}

const DetailNodes = (props: DetailNodesProps) => {
  const transitions = useTransition(props.nodes, {
    keys: (node) => node.id,
    from: (node) => ({
      cx: node.x,
      cy: node.y,
      fill: node.fill,
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
        fill: node.fill,
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
}

export default DetailNodes;