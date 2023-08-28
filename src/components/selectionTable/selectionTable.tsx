import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useAtom, useAtomValue } from 'jotai';
import {
    selectedProteinsAtom,
    tableAtom,
    tableModelAtom,
    columnVisibilityAtom
} from './tableStore';
import { Box, Typography } from '@mui/material';

const SelectionTable = () => {
    const [tableData] = useAtom(tableAtom);
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const tableModel = useAtomValue(tableModelAtom);
    const [columnVisibility, setColumnVisibility] =
        useAtom(columnVisibilityAtom);
    const rows = tableData.rows;
    const columns = tableData.columns;
    return (
        <Box style={{ maxWidth: '100%', width: '100%', height: '100%' }}>
            <Typography variant="subtitle2" component="div" style={{marginLeft:"1em"}}>
                *The data from this table corresponds to the data presented by Goncalves et al. (2022) in their supplementary table S5 "All Drug-Protein associations".
            </Typography>
            <DataGrid
                rows={rows}
                columns={columns}
                rowHeight={40}
                checkboxSelection
                disableRowSelectionOnClick
                disableDensitySelector
                columnVisibilityModel={columnVisibility}
                onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibility(newModel)
                }
                rowSelectionModel={tableModel}
                onRowSelectionModelChange={(selection) => {
                    //setTableModel(selection);
                    // when the model changes, we need to update the network data
                    // for this we call getEgoNetworkNetworkData with the IDs of the selected rows
                    const ids = selection.map(
                        // FIXME ID is not a number
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore ts2304
                        (id) => rows[id-1]['UniprotID_inString']
                    );
                    const selectedIDs = ids
                        .filter((id) => !selectedProteins.includes(id));
                    const deselectedIDs = selectedProteins.filter(
                        (d) => !ids.includes(d)
                    );
                    if (selectedIDs.length > 0 || deselectedIDs.length > 0) {
                        setSelectedProteins(selectedIDs.concat(deselectedIDs));
                    }
                }}
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                    toolbar: {
                        showQuickFilter: true,
                        quickFilterProps: { debounceMs: 500 },
                        printOptions: { disableToolbarButton: true },
                        csvOptions: { disableToolbarButton: true }
                    }
                }}
            ></DataGrid>
        </Box>
    );
};

export default SelectionTable;
