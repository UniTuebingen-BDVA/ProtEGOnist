import { useAtom, useSetAtom } from 'jotai';
import { SpringValue, animated } from '@react-spring/web';
import AdvancedTooltip from '../../utilityComponents/advancedTooltip';
import { memo, useState } from 'react';
import { contextMenuAtom } from '../../utilityComponents/contextMenuStore';

interface DetailNodeProps {
    id: string;
    size: number;
    styleParam: { [key: string]: number | string | undefined | null | boolean };
}

const DetailNode = memo(function DetailNode(
    props: DetailNodeProps
) {
  const { id, size,styleParam } = props;
  const setContextMenu = useSetAtom(contextMenuAtom);

  return (
   <AdvancedTooltip nodeID={id} key={id}>
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
          strokeOpacity={1.0}
          strokeWidth={size}
      />
  </AdvancedTooltip>
);
});
export default DetailNode;
