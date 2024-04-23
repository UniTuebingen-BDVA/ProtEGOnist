import { useTransition } from '@react-spring/web';
import DetailNode from './detailNode';

interface DetailNodesProps {
  nodes: {
    id: string;
    cx: number;
    cy: number;
    fill: string;
    size: number;
  }[];
}

const DetailNodes = (props: DetailNodesProps) => {
  const transitions = useTransition(props.nodes, {
    keys: (node) => node.id,
    from: (node) => ({
      cx: node.cx,
      cy: node.cy,
      fill: node.fill,
      opacity: 0
    }),
    leave: () => async (next, _cancel) => {
      await next({
        opacity: 0
      });
    },
    update: (node) => async (next, _cancel) => {
      await next({
        cx: node.cx,
        cy: node.cy,
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