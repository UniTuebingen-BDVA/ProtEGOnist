// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { useAtom } from 'jotai';
import { tableAtom } from '../selectionTable/tableStore';
import { Tooltip } from '@mui/material';
import React, { memo } from 'react';
interface AdvancedTooltipProps {
    uniprotID: string;
    additionalData?: string;
    children: React.ReactNode;
}

interface TooltipContentProps {
    uniprotID: string;
    additionalData?: string;
}

//generate a custom content for the tooltip based on the uniprot ID
const TooltipContent = memo(function TooltipContent({
    uniprotID,
    additionalData
}: TooltipContentProps) {
    const [tableData] = useAtom(tableAtom);

    // find the rows in the table that match the uniprot ID
    const filteredRows = tableData.rows.filter((row) => {
        return row['UniprotID_inString'] === uniprotID;
    });

    const proteinNames = filteredRows.map((row) => row['x_id']);
    // generate set of unique protein names
    const uniqueProteinNames = [...new Set(proteinNames)];

    const drugNames = filteredRows.map((row) => row['drug_name']);
    // generate set of unique drug names
    const uniqueDrugNames = [...new Set(drugNames)];

    return (
        <div key={uniprotID}>
            {uniqueProteinNames.length > 0 && (
                <>
                    <h2>{uniqueProteinNames.join(' ')}</h2>
                </>
            )}
            UniprotID: {uniprotID}
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
    uniprotID,
    additionalData,
    children
}: AdvancedTooltipProps) {
    return (
        <Tooltip
            title={
                <TooltipContent
                    uniprotID={uniprotID}
                    additionalData={additionalData}
                    key={uniprotID}
                />
            }
        >
            {children}
        </Tooltip>
    );
});

export default AdvancedTooltip;
