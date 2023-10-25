// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useAtom } from 'jotai';
import { tableAtom } from '../selectionTable/tableStore';
import { nameNodesByAtom, showOnTooltipAtom } from '../../apiCalls';
import { Tooltip } from '@mui/material';
import React, { memo } from 'react';
interface AdvancedTooltipProps {
    nodeID: string;
    additionalData?: string;
    children: React.ReactNode;
}

interface TooltipContentProps {
    nodeID: string;
    additionalData?: string;
}

//generate a custom content for the tooltip based on the uniprot ID
const TooltipContent = memo(function TooltipContent({
    nodeID,
    additionalData
}: TooltipContentProps) {
    const [tableData] = useAtom(tableAtom);
    const [nameNodesBy] = useAtom(nameNodesByAtom)
    const [showOnTooltip] = useAtom(showOnTooltipAtom)

    const nodeData = tableData.rows[nodeID]

    // split data if available
    const proteinNames = (nodeData?.[nameNodesBy] ?? "").split(';').filter((x) => x !== "");
    let tooltipData = {}
    for (let showTooltip of showOnTooltip) {
        tooltipData[showTooltip] = [... new Set((nodeData?.[showTooltip] ?? "").split(';').filter((x) => x !== ""))];

    }
    // generate set of unique protein names
    const uniqueProteinNames = [...new Set(proteinNames)];

    return (
        <div key={nodeID}>
            {uniqueProteinNames.length > 0 && (
                <>
                    <h2>{uniqueProteinNames.join(' ')}</h2>
                </>
            )}
            nodeID: {nodeID}
            <br />
            {Object.keys(tooltipData).length > 0 && (
                <>
                    {Object.entries(tooltipData).map(([key, iter]) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>{key} </span>
                                <ul>
                                    {iter.map((ele) => (
                                        <li key={ele}>{ele}</li>
                                    ))}
                                </ul>
                            </div>


                    ))
                    }
                </>
            )}
        </div>
    );
});

const AdvancedTooltip = memo(function AdvancedTooltip({
    nodeID,
    additionalData,
    children
}: AdvancedTooltipProps) {
    return (
        <Tooltip
            title={
                <TooltipContent
                    nodeID={nodeID}
                    additionalData={additionalData}
                    key={nodeID}
                />
            }
        >
            {children}
        </Tooltip>
    );
});

export default AdvancedTooltip;
