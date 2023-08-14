import { useAtom } from 'jotai';
import { tableAtom } from '../selectionTable/tableStore';
import { Tooltip } from '@mui/material';
import React from 'react';

interface AdvancedTooltipProps {
    uniprotID: string;
    children: React.ReactNode;
}

interface TooltipContentProps {
    uniprotID: string;
}

//generate a custom content for the tooltip based on the uniprot ID
const TooltipContent = ({ uniprotID }: TooltipContentProps) => {
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
            <h2>{uniqueProteinNames.join(' ')}</h2>
            UniprotID: {uniprotID}
            <br />
            Drugs that target this protein:
            <ul>
                {uniqueDrugNames.map((drug) => (
                    <li key={drug}>{drug}</li>
                ))}
            </ul>
        </div>
    );
};

const AdvancedTooltip = ({ uniprotID, children }: AdvancedTooltipProps) => {
    return (
        <Tooltip
            title={<TooltipContent uniprotID={uniprotID} key={uniprotID} />}
        >
            {children}
        </Tooltip>
    );
};

export default AdvancedTooltip;
