import { useAtom, useSetAtom } from 'jotai';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import { getRadarAtom } from '../../apiCalls';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';
import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';
import { memo } from 'react';

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
    const setSelectedProteins = useSetAtom(selectedProteinsAtom);
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    const highlightNodeSet = useSetAtom(highlightNodeAtom);
    const { x, y, id, size, color } = props;
    const transform = `translate(${x}, ${y})`;
    return (
        <AdvancedTooltip uniprotID={id} key={id}>
            <g
                key={id}
                transform={transform}
                onClick={() => {
                    getRadarData(id);
                    setSelectedProteins([id]);
                }}
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
