import { useAtom, useSetAtom } from 'jotai';
import {
    selectedProteinsAtom,
    selectedProteinsStoreAtom,
    tableAtom
} from '../selectionTable/tableStore';
import {
    getEgoNetworkAndRadar,
    getEgoNetworkNetworkAtom,
    nameNodesByAtom
} from '../../apiCalls';
import AdvancedTooltip from '../utilityComponents/advancedTooltip.tsx';
import { highlightNodeAtom } from './egoNetworkNetworkOverviewStore';
import { memo, useCallback } from 'react';
import { updateDecollapseIdsAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore.ts';

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
    const [selectedProteins] = useAtom(selectedProteinsAtom);
    const setSelectedProteins = useSetAtom(selectedProteinsStoreAtom);
    const getNetworkAndRadar = useSetAtom(getEgoNetworkAndRadar);
    const getEgoNetworkNetwork = useSetAtom(getEgoNetworkNetworkAtom);
    const highlightNodeSet = useSetAtom(highlightNodeAtom);
    const updateDecollapseIds = useSetAtom(updateDecollapseIdsAtom);
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const [_contextMenu, setContextMenu] = useAtom(contextMenuAtom);

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
        [
            getEgoNetworkNetwork,
            getNetworkAndRadar,
            selectedProteins,
            setSelectedProteins,
            updateDecollapseIds
        ]
    );
    const getNodeName = (id) => {
        // find the rows in the table that match the uniprot ID
        // const filteredRows = tableData.rows.filter((row) => {
        //     return row['nodeID'] === id;
        // });
        const nodeData = tableData.rows[id];

        const nodeNames = (nodeData?.[nameNodesBy] ?? nodeData.nodeID).split(
            ';'
        );
        // generate set of unique protein names
        const uniqueNodeNames = [...new Set(nodeNames)];
        // join the protein names with a comma
        return uniqueNodeNames.join(', ');
    };
    const text = size > 15 ? getNodeName(id) : '';
    const transform = `translate(${x}, ${y})`;
    return (
        <AdvancedTooltip nodeID={id} key={id}>
            <g
                key={id}
                transform={transform}
                onContextMenu={(event) => {
                    setContextMenu(event, id);
                }}
                onClick={() => handleClick(id)}
                onMouseEnter={() => {
                    highlightNodeSet(id);
                }}
                onMouseLeave={() => {
                    highlightNodeSet('');
                }}
            >
                <path
                    id={id + '_label'}
                    fill={'none'}
                    stroke="none"
                    d={`
                    M 0 0
                    m 0, ${size}
                    a ${size},${size} 0 1,1,0 -${size * 2}
                    a ${size},${size} 0 1,1,0  ${size * 2}
                    `}
                />
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
                <text
                    width={30}
                    textAnchor="middle"
                    fontSize={size / 2.5}
                    dy={'-0.35em'}
                >
                    <textPath
                        startOffset={'50%'}
                        xlinkHref={'#' + id + '_label'}
                    >
                        {text}
                    </textPath>
                </text>
            </g>
        </AdvancedTooltip>
    );
});

export default EgoNetworkNetworkNode;
