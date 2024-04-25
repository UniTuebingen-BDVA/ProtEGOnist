import { useAtom, useSetAtom } from 'jotai';
import { SpringValue, animated } from '@react-spring/web';
import AdvancedTooltip from '../../utilityComponents/advancedTooltip';
import { memo, useState } from 'react';
import { contextMenuAtom } from '../../utilityComponents/contextMenuStore';
import { selectedProteinsAtom } from '../../selectionTable/tableStore';
import { selectedNodeAtom } from './detailStore';
import { hoverAtom } from '../../utilityComponents/hoverStore';

/**
 * Represents the props for the DetailNode component.
 */
interface DetailNodeProps {
    id: string;
    size: number;
    component: number;
    styleParam: { [key: string]: number | string | undefined | null | boolean };
}

/**
 * Represents a detail node component.
 * @param props - The props for the DetailNode component.
 * @returns The rendered DetailNode component.
 */
const DetailNode = memo(function DetailNode(props: DetailNodeProps) {
    const { id, size, component, styleParam } = props;
    const setContextMenu = useSetAtom(contextMenuAtom);
    const [nodesInSubnetwork] = useAtom(selectedProteinsAtom);
    const [selectedNode, setSelectedNode] = useAtom(selectedNodeAtom);
    const [hoveredNode, setHoveredNode] = useAtom(hoverAtom);

    const color = (id, component) => {
        if (selectedNode) {
            if (id === selectedNode) {
                return 'red';
            }
            return '#dddddd';
        }

        if (nodesInSubnetwork.includes(id)) {
            return '#ff7f00';
        }
        // else color depends on component
        if (component === 0) {
            return 'grey';
        } else {
            return '#00ff00';
        }
    };

    const strokeColor = (id: string) => {
        if (id === hoveredNode) {
            return 'red';
        }
        return 'black';
    };

    const strokeWidth = (id: string) => {
        if (id === hoveredNode) {
            return 3;
        }
        return 0.2;
    };

    const nodeSize = (id) => {
        if (selectedNode) {
            if (id === selectedNode) {
                return '5';
            }
            return '1';
        }
        if (nodesInSubnetwork.includes(id)) {
            return 5;
        }
        return 2;
    };
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
                onClick={() => {
                    setSelectedNode(id);
                }}
                onMouseEnter={() => {
                    setHoveredNode(id);
                }}
                onMouseLeave={() => {
                    setHoveredNode('');
                }}
                style={{ pointerEvents: 'all', cursor: 'context-menu' }}
                key={id}
                r={nodeSize(id)}
                fill={color(id, component)}
                fillOpacity={1}
                // FIXME Type not fully correct
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                cx={styleParam.cx}
                // FIXME Type not fully correct
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore ts2304
                cy={styleParam.cy}
                stroke={strokeColor(id)}
                style={{ ...styleParam }}
                strokeOpacity={1.0}
                strokeWidth={strokeWidth(id)}
            />
        </AdvancedTooltip>
    );
});
export default DetailNode;
