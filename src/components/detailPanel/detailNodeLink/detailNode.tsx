import { useAtom, useSetAtom } from 'jotai';
import { SpringValue, animated } from '@react-spring/web';
import AdvancedTooltip from '../../utilityComponents/advancedTooltip';
import { memo, useState } from 'react';
import { contextMenuAtom } from '../../utilityComponents/contextMenuStore';
import { selectedProteinsAtom } from '../../selectionTable/tableStore';

/**
 * Represents the props for the DetailNode component.
 */
interface DetailNodeProps {
    id: string;
    size: number;
    styleParam: { [key: string]: number | string | undefined | null | boolean };
}

/**
 * Represents a detail node component.
 * @param props - The props for the DetailNode component.
 * @returns The rendered DetailNode component.
 */
const DetailNode = memo(function DetailNode(props: DetailNodeProps) {
    const { id, size, styleParam } = props;
    const setContextMenu = useSetAtom(contextMenuAtom);
    const [nodesInSubnetwork] = useAtom(selectedProteinsAtom);
    return (
        <AdvancedTooltip nodeID={id} key={id}>
            <animated.circle
                /**
                 * Handles the context menu event for the circle.
                 * @param event - The context menu event.
                 */
                onContextMenu={(event) => {
                    setContextMenu(event, id, 'radar');
                }}
                style={{ pointerEvents: 'all', cursor: 'context-menu' }}
                key={id}
                r={nodesInSubnetwork.includes(id) ? size * 2 : size}
                fill={nodesInSubnetwork.includes(id) ? '#ff7f00' : 'gray'}
                fillOpacity={1}
                // FIXME Type not fully correct
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                cx={styleParam.cx}
                // FIXME Type not fully correct
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                cy={styleParam.cy}
                stroke={'black'}
                style={{ ...styleParam }}
                strokeOpacity={1.0}
                strokeWidth={0.2}
            />
        </AdvancedTooltip>
    );
});
export default DetailNode;
