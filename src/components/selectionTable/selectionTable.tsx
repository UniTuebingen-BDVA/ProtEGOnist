import { DataGrid, GridToolbar, GridRowParams } from '@mui/x-data-grid';
import { useAtom, useAtomValue } from 'jotai';
import {
    selectedProteinsAtom,
    tableAtom,
    columnVisibilityAtom,
    tableModelSelectedAtom
} from './tableStore';
import { Box, Typography } from '@mui/material';
import { startDataOverview } from '../../apiCalls';

const SelectionTable = () => {
    const [tableData] = useAtom(tableAtom);
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const tableModel = useAtomValue(tableModelSelectedAtom);
    const [columnVisibility, setColumnVisibility] =
        useAtom(columnVisibilityAtom);
    const rows = tableData.rows;
    
    const columns = [...tableData.columns, 
        {"field": "selected", "headerName": "Selected?", "width": 100, "valueGetter": (params) =>  selectedProteins.includes(params.row.UniprotID_inString) ? "Yes" : "No"},
        {"field": "overview", "headerName": "Found in Overview?", "width": 100, "valueGetter": (params) =>  startDataOverview.includes(params.row.UniprotID_inString) ? "Yes" : "No"}];
    // const aragProts = rows.filter((row) => row.drug_name === "Ara-G" && startDataOverview.includes(row.UniprotID_inString)).map((row) => row.UniprotID_inString);
    // console.log(aragProts)

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
                isRowSelectable={(params: GridRowParams) => params.row.UniprotID_inString !== "not found"}
                onRowSelectionModelChange={(selection) => {
                    // when the model changes, we need to update the network data
                    // for this we call getEgoNetworkNetworkData with the IDs of the selected rows
                    const ids = selection.map(
                      (id: number) => rows[id-1]['UniprotID_inString']
                    );
                    const selectedIDs = ids
                        .filter((id) => !selectedProteins.includes(id));
                    const deselectedIDs = selectedProteins.filter(
                        (d) => !ids.includes(d)
                    );
                    if (selectedIDs.length > 0 || deselectedIDs.length > 0) {
                        const updateProteins = selectedIDs.concat(deselectedIDs).filter((id) => id !== 'not found');
                        setSelectedProteins(updateProteins);
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
