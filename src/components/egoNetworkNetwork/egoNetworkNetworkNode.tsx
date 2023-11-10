import { useAtom, useSetAtom } from 'jotai';
import {
    decollapseNodeAtom,
    highlightedEdgesAtom
} from './egoNetworkNetworkStore';
import { SpringValue, animated } from '@react-spring/web';
import AdvancedTooltip from '../utilityComponents/advancedTooltip';
import {
    drugsPerProteinAtom,
    drugsPerProteinColorscaleAtom
} from '../selectionTable/tableStore';
import { memo, useState } from 'react';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    animatedParams: {
        opacity: number | SpringValue<number>;
        transform: string | SpringValue<string>;
    };
}

const EgoNetworkNetworkNode = memo(function EgoNetworkNetworkNode(
    props: EgoNetworkNetworkNodeProps
) {
    const { id, size, animatedParams } = props;
    const setDecollapseID = useSetAtom(decollapseNodeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const [drugsPerProtein] = useAtom(drugsPerProteinAtom);
    const [highlightedEdges] = useAtom(highlightedEdgesAtom);
    const [isHovered, setIsHovered] = useState(false);
    const setContextMenu = useSetAtom(contextMenuAtom);

    const color = colorscale(drugsPerProtein[id]);
    return (
        <AdvancedTooltip nodeID={id} key={id}>
            <animated.g
                key={id}
                transform={animatedParams.transform}
                opacity={animatedParams.opacity}
                onContextMenu={(event) => {
                    setContextMenu(event, id);
                }}
                onClick={() => setDecollapseID(id)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{ cursor: 'pointer' }}
            >
                <circle
                    r={size}
                    fill={color}
                    stroke="black"
                    strokeWidth={
                        highlightedEdges.ids.includes(id) || isHovered ? 3 : 1
                    }
                />
                <circle
                    r={(size * 2) / 3}
                    fill={'none'}
                    stroke="black"
                    strokeWidth="1"
                />
                <circle
                    r={size * 0.05 > 1 ? size * 0.05 : 1}
                    opacity={0.75}
                    fill={'black'}
                    stroke="black"
                    strokeWidth="1"
                />
            </animated.g>
        </AdvancedTooltip>
    );
});

export default EgoNetworkNetworkNode;
