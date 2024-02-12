import { useAtom, useSetAtom } from 'jotai';
import {
    decollapseNodeAtom,
    highlightedEdgesAtom
} from './egoNetworkNetworkStore';
import { SpringValue, animated } from '@react-spring/web';
import AdvancedTooltip from '../utilityComponents/advancedTooltip';
import {
    drugsPerProteinAtom,
    drugsPerProteinColorscaleAtom,
    tableAtom
} from '../selectionTable/tableStore';
import { memo, useState } from 'react';
import { contextMenuAtom } from '../utilityComponents/contextMenuStore';
import { nameNodesByAtom, quantifyNodesByAtom } from '../../apiCalls';

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
    const [highlightedEdges] = useAtom(highlightedEdgesAtom);
    const [isHovered, setIsHovered] = useState(false);
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const setContextMenu = useSetAtom(contextMenuAtom);

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

        const nodeNames = (nodeData?.[nameNodesBy] ?? nodeData.nodeID).split(
            ';'
        );
        // generate set of unique protein names
        const uniqueNodeNames = [...new Set(nodeNames)];
        // join the protein names with a comma
        return uniqueNodeNames.join(', ');
    };

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
                <path
                id={id+"_labelArc"}
                fill='none'
                stroke='none'
                d={`
                M 0 0
                m 0, ${size}
                a ${size},${size} 0 1,1,0 -${size * 2}
                a ${size},${size} 0 1,1,0  ${size * 2}
                `}
                >

                </path>
                <text
                    textAnchor="middle"
                    fontSize={size / 3 < 16 ? 16 : size / 3}
                    dy={`-${size / 10}`}
                >
                    <textPath
                        startOffset={'50%'}
                        href={'#'+id+"_labelArc"}
                    >
                        {getNodeName(id)}
                    </textPath>
                </text>
            </animated.g>
        </AdvancedTooltip>
    );
});

export default EgoNetworkNetworkNode;
