import { useSetAtom } from 'jotai';
import { animated } from '@react-spring/web';
import { memo } from 'react';
import { contextMenuAtom } from '../../utilityComponents/contextMenuStore';

/**
 * Represents the props for the DetailNode component.
 */
interface DetailNodeProps {
    id: string;
    size: number;
    styleParam: { [key: string]: number | string | undefined | null | boolean };
}

/**
 * Renders a detail node link component.
 *
 * @component
 * @param {DetailNodeProps} props - The props for the component.
 * @returns {JSX.Element} The rendered detail node link component.
 */
const DetailNode = memo(function DetailNode(
    props: DetailNodeProps
) {
  const { id, styleParam } = props;
  const setContextMenu = useSetAtom(contextMenuAtom);

  return (
      <animated.line
          onContextMenu={(event) => {
              setContextMenu(event, id, 'radar');
          }}
          style={{"pointerEvents": "all", "cursor": "context-menu"}}
          key={id}
          x1={styleParam.x1}
          y1={styleParam.y1}
          x2={styleParam.x2}
          y2={styleParam.y2}
          stroke={"black"}
          style={{ ...styleParam }}
          strokeOpacity={.7}
          strokeWidth={.1}
      />
);
});
export default DetailNode;
