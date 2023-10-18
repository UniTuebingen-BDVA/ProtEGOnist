// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useAtom } from 'jotai';
import { tableAtom } from '../selectionTable/tableStore';
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

    const nodeData = tableData.rows[nodeID]

    // split data if available
    const proteinNames = nodeData?.["x_id"].split(';') ?? [];
    const drugNames = nodeData?.["drug_name"].split(';') ?? [];

    // generate set of unique protein names
    const uniqueProteinNames = [...new Set(proteinNames)];
    // generate set of unique drug names
    const uniqueDrugNames = [...new Set(drugNames)];

    return (
        <div key={nodeID}>
            {uniqueProteinNames.length > 0 && (
                <>
                    <h2>{uniqueProteinNames.join(' ')}</h2>
                </>
            )}
            nodeID: {nodeID}
            <br />
            {additionalData && (
                <>
                    {additionalData}
                    <br />{' '}
                </>
            )}
            {uniqueDrugNames.length > 0 && (
                <>
                    Drugs that target this protein:
                    <ul>
                        {uniqueDrugNames.map((drug) => (
                            <li key={drug}>{drug}</li>
                        ))}
                    </ul>
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
