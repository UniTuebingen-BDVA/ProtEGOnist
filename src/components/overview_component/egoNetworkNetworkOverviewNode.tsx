import { useAtom, useSetAtom } from 'jotai';
import {
    selectedProteinsAtom,
    selectedProteinsStoreAtom
} from '../selectionTable/tableStore';
import {
    getEgoNetworkAndRadar,
    getEgoNetworkNetworkAtom
} from '../../apiCalls';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';
import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';
import { memo, useCallback } from 'react';
import { updateDecollapseIdsAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: string;
    x: number;
    y: number;
}

const EgoNetworkNetworkNode = memo(function EgoNetworkNetworkNode(
    props: EgoNetworkNetworkNodeProps
) {
    const [selectedProteins] =
        useAtom(selectedProteinsAtom);
    const setSelectedProteins = useSetAtom(selectedProteinsStoreAtom)
    const getNetworkAndRadar = useSetAtom(getEgoNetworkAndRadar);
    const getEgoNetworkNetwork = useSetAtom(getEgoNetworkNetworkAtom)
    const highlightNodeSet = useSetAtom(highlightNodeAtom);
    const updateDecollapseIds = useSetAtom(updateDecollapseIdsAtom)
    const { x, y, id, size, color } = props;
    const handleClick = useCallback(
        (id: string) => {
            // Remove duplicates from the incoming `ids` array
            const updatedProteins = selectedProteins.slice();
            // Calculate proteins to delete and proteins to add
            if (updatedProteins.includes(id)) {
                updatedProteins.splice(updatedProteins.indexOf(id), 1);
                setSelectedProteins(updatedProteins);
                updateDecollapseIds(updatedProteins);
                getEgoNetworkNetwork(updatedProteins);
            } else {
                updatedProteins.push(id);
                setSelectedProteins(updatedProteins);
                getNetworkAndRadar(updatedProteins, id);
            }
        },
        [getEgoNetworkNetwork, getNetworkAndRadar, selectedProteins, setSelectedProteins, updateDecollapseIds]
    );
    const transform = `translate(${x}, ${y})`;
    return (
        <AdvancedTooltip nodeID={id} key={id}>
            <g
                key={id}
                transform={transform}
                onClick={() => handleClick(id)}
                onMouseEnter={() => {
                    highlightNodeSet(id);
                }}
                onMouseLeave={() => {
                    highlightNodeSet('');
                }}
            >
                <circle r={size} fill={color} stroke="black" strokeWidth="1" />
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
            </g>
        </AdvancedTooltip>
    );
});

export default EgoNetworkNetworkNode;
