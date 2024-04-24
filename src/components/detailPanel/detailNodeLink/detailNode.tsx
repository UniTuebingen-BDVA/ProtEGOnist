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
      <animated.circle
          onContextMenu={(event) => {
              setContextMenu(event, id, 'radar');
          }}
          style={{"pointerEvents": "all", "cursor": "context-menu"}}
          key={id}
          r={size}
          fill={"red"}
          fillOpacity={1}
          // FIXME Type not fully correct
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore ts2304
          cx={styleParam.cx}
          // FIXME Type not fully correct
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore ts2304
          cy={styleParam.cy}
          stroke={"orange"}
          style={{ ...styleParam }}
          strokeOpacity={1.0}
          strokeWidth={1}
      />
  </AdvancedTooltip>
);
});
export default DetailNode;
