import { useAtom } from 'jotai';
import { tableAtom } from '../selectionTable/tableStore';
import { nameNodesByAtom, showOnTooltipAtom } from '../../apiCalls';
import { memo } from 'react';
import { hoverAtom } from './hoverStore';
import { Paper } from '@mui/material';

//generate a custom content for the tooltipwindow based on the selectedNode
const TooltipContent = memo(function TooltipContent(props: {
    hoveredNode: string;
}) {
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom);
    const [showOnTooltip] = useAtom(showOnTooltipAtom);
    const { hoveredNode } = props;
    const nodeData = tableData.rows[hoveredNode];

    // split data if available
    const displayNames = (nodeData?.[nameNodesBy] ?? '')
        .split(';')
        .filter((x) => x !== '');
    let tooltipData = {};
    for (let showTooltip of showOnTooltip) {
        tooltipData[showTooltip] = [
            ...new Set(
                (String(nodeData?.[showTooltip]) ?? '')
                    .split(';')
                    .filter((x) => x !== '')
            )
        ];
    }
    // generate set of unique display names
    const uniqueDisplayNames = [...new Set(displayNames)];

    return (
        <div key={hoveredNode}>
            {uniqueDisplayNames.length > 0 && (
                <>
                    <h4>{uniqueDisplayNames.join(' ')}</h4>
                </>
            )}
            nodeID: {hoveredNode}
            <br />
            {Object.keys(tooltipData).length > 0 && (
                <>
                    {Object.entries(tooltipData).map(([key, iter]) => (
                        <div
                            key={key}
                            style={{
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <span
                                style={{
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8em'
                                }}
                            >
                                {key}{' '}
                            </span>
                            <ul
                                style={{
                                    listStyleType: 'none',
                                    padding: 5,
                                    margin: 5
                                }}
                            >
                                {iter.map((ele) => (
                                    <li
                                        style={{
                                            overflow: 'auto',
                                            fontSize: '0.8em'
                                        }}
                                        key={ele}
                                    >
                                        {ele}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
});

// display the tooltip content in a fixed position window
export const TooltipWindow = memo(function tooltipWindow() {
    const [hoveredNode] = useAtom(hoverAtom);

    return (
        <Paper
            elevation={3}
            color="grey"
            style={{
                position: 'absolute',
                bottom: '10px',
                left: '10px',
                padding: hoveredNode === '' ? '0%' : '10px',
                // if hoveredNode is empty, hide the tooltip
                width: hoveredNode === '' ? '0%' : '30%',
                transition: 'all .5s ease'
            }}
        >
            {/* display the tooltip content coditionally */}
            {hoveredNode !== '' && <TooltipContent hoveredNode={hoveredNode} />}
        </Paper>
    );
});
