import { useTransition } from '@react-spring/web';
import DetailLink from './detailLink';

interface DetailLinksProps {
  links: {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  }[];
}

const DetailLinks = (props: DetailLinksProps) => {
  const transitions = useTransition(props.links, {
    keys: (link) => link.id,
    from: (link) => ({
      x1: link.x1,
      y1: link.y1,
      x2: link.x2,
      y2: link.y2,
      opacity: 1
    }),
    leave: () => async (next, _cancel) => {
      await next({
        opacity: 1
      });
    },
    update: (link) => async (next, _cancel) => {
      await next({
        x1: link.x1,
        y1: link.y1,
        x2: link.x2,
        y2: link.y2,
        opacity: 1
      });
    }
  });
  return (
    <>
      {transitions((style, link) => (
        <DetailLink
          key={link.id}
          id={link.id}
          size={5}
          styleParam={style}
        />
      ))}
    </>
  );
}

export default DetailLinks;