import { useAtom, useSetAtom } from 'jotai';
import { decollapseNodeAtom } from './egoNetworkNetworkStore';
import { animated, SpringValue } from '@react-spring/web';
import {
    drugsPerProteinAtom,
    drugsPerProteinColorscaleAtom,
    tableAtom
} from '../selectionTable/tableStore';
import { memo, useMemo, useState } from 'react';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore';
import { nameNodesByAtom, quantifyNodesByAtom } from '../../apiCalls';
import { selectedEgoGraphsAtom } from './egoNetworkNetworkStore.ts';
import { hoverAtom, hoverColor } from '../utilityComponents/hoverStore.ts';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    density: number;
    animatedParams: {
        opacity: number | SpringValue<number>;
        transform: string | SpringValue<string>;
    };
}

const EgoNetworkNetworkNode = memo(function EgoNetworkNetworkNode(
    props: EgoNetworkNetworkNodeProps
) {
    const { id, size, density, animatedParams } = props;
    const setDecollapseID = useSetAtom(decollapseNodeAtom);
    const [colorscale] = useAtom(drugsPerProteinColorscaleAtom);
    const [drugsPerProtein] = useAtom(drugsPerProteinAtom);
    const [quantifyNodesBy] = useAtom(quantifyNodesByAtom);
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const [selectedEgoGraphs, setSelectedEgoGraphs] = useAtom(
        selectedEgoGraphsAtom
    );
    const [hoveredNode, setHoveredNode] = useAtom(hoverAtom);
    const [isLocallyHovered, setIsLocallyHovered] = useState(false);
    const setContextMenu = useSetAtom(contextMenuAtom);
    const isHovered = hoveredNode === id;
    const isSelected = useMemo(
        () => selectedEgoGraphs.includes(id),
        [selectedEgoGraphs, id]
    );
    const strokeColor = () => {
        if (isLocallyHovered || !(isHovered || isSelected)) {
            return 'black';
        } else {
            return hoverColor;
        }
    };
    const strokeWidth = isLocallyHovered || isHovered || isSelected ? 3 : 1;
    const scaledSize = size * 1.1;
    const color =
        quantifyNodesBy['label'] != 'default'
            ? colorscale(drugsPerProtein[id])
            : colorscale(density);
    const getNodeName = (id) => {
        // find the rows in the table that match the uniprot ID
        // const filteredRows = tableData.rows.filter((row) => {
        //     return row['nodeID'] === id;
        // });
        const nodeData = tableData.rows[id];
        const nodeNames = String(
            nodeData?.[nameNodesBy] ?? nodeData.nodeID
        ).split(';');
        // generate set of unique protein names
        const uniqueNodeNames = [...new Set(nodeNames)];
        // join the protein names with a comma
        return uniqueNodeNames.join(', ');
    };

    return (
        <animated.g
            key={id}
            transform={animatedParams.transform}
            opacity={animatedParams.opacity}
            onContextMenu={(event) => {
                setContextMenu(event, id, 'subnetwork');
            }}
            onClick={() => setSelectedEgoGraphs(id)}
            onDoubleClick={() => setDecollapseID(id)}
            onMouseEnter={() => {
                setHoveredNode(id);
                setIsLocallyHovered(true);
            }}
            onMouseLeave={() => {
                setHoveredNode('');
                setIsLocallyHovered(false);
            }}
            style={{ pointerEvents: 'all', cursor: 'context-menu' }}
        >
            <circle
                r={size}
                fill={color}
                stroke={strokeColor()}
                strokeWidth={strokeWidth}
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
            <path
                id={id + '_labelArc'}
                fill="none"
                stroke="none"
                d={`
                M 0 0
                m 0, ${scaledSize}
                a ${scaledSize},${scaledSize} 0 1,1,0 -${scaledSize * 2}
                a ${scaledSize},${scaledSize} 0 1,1,0  ${scaledSize * 2}
                `}
            ></path>
            <text
                textAnchor="middle"
                fontSize={scaledSize / 7 < 18 ? 18 : scaledSize / 7}
                fontFamily={'monospace'}
            >
                <textPath startOffset={'50%'} href={'#' + id + '_labelArc'}>
                    {getNodeName(id)}
                </textPath>
            </text>
            <title>{id}</title>
        </animated.g>
    );
});

export default EgoNetworkNetworkNode;
