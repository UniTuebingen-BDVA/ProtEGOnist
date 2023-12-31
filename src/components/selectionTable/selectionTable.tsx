import { DataGrid, GridToolbar, GridFilterModel } from '@mui/x-data-grid';
import { useAtom, useAtomValue } from 'jotai';
import {
    selectedProteinsAtom,
    tableAtom,
    columnVisibilityAtom,
    tableModelSelectedAtom
} from './tableStore';
import { Box, Typography } from '@mui/material';
import { startDataOverview } from '../../apiCalls';
import { filteredIntersectionsAtom } from '../egograph/egoGraphBundleStore';

const SelectionTable = () => {
    const [tableData] = useAtom(tableAtom);
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [filteredIntersections] = useAtom(filteredIntersectionsAtom);
    const tableModel = useAtomValue(tableModelSelectedAtom);
    const [columnVisibility, setColumnVisibility] =
        useAtom(columnVisibilityAtom);
    const rows = Object.entries(tableData.rows).map(([key, value], index) => {
        return { ...value, nodeID: key, ID: index };
    });

    const initFilterModel: GridFilterModel = {
        items: [
            { id: 1, field: 'with_metadata', operator: 'equals', value: 'true' }
        ]
    };
    const columns = [
        ...tableData.columns,
        {
            field: 'selected',
            headerName: 'Selected?',
            width: 100,
            valueGetter: (params) =>
                selectedProteins.includes(params.row.nodeID) ? 'Yes' : 'No'
        },
        {
            field: 'overview',
            headerName: 'Found in Overview?',
            width: 100,
            valueGetter: (params) =>
                startDataOverview.includes(params.row.nodeID) ? 'Yes' : 'No'
        },
        {
            field: 'inBand',
            headerName: 'In Intersection?',
            width: 100,
            valueGetter: (params) =>
                filteredIntersections.includes(params.row.nodeID) ? 'Yes' : 'No'
        }
    ];

    return (
        <Box style={{ maxWidth: '100%', width: '100%', height: '100%' }}>
            <Typography
                component={'span'}
                variant="subtitle2"
                component="div"
                style={{ marginLeft: '1em' }}
            >
                {/* *The data from this table corresponds to the data presented by Goncalves et al. (2022) in their supplementary table S5 "All Drug-Protein associations". */}
            </Typography>
            <DataGrid
                initialState={{
                    filter: {
                        filterModel: initFilterModel
                    }
                }}
                rows={rows}
                getRowId={(row) => row.ID}
                columns={columns}
                rowHeight={40}
                checkboxSelection
                columnVisibilityModel={columnVisibility}
                isRowSelectable={(params) => params.row.found_in_network}
                onColumnVisibilityModelChange={(newModel) =>
                    setColumnVisibility(newModel)
                }
                disableRowSelectionOnClick
                disableDensitySelector
                rowSelectionModel={tableModel}
                // isRowSelectable={(params: GridRowParams) => params.row.nodeID !== "not found"}

                onRowSelectionModelChange={(selection) => {
                    // when the model changes, we need to update the network data
                    // for this we call getEgoNetworkNetworkData with the IDs of the selected rows
                    const ids = selection.map(
                        (id: number) => rows[id]['nodeID']
                    );
                    const selectedIDs = ids.filter(
                        (id) => !selectedProteins.includes(id)
                    );
                    const deselectedIDs = selectedProteins.filter(
                        (d) => !ids.includes(d)
                    );
                    if (selectedIDs.length > 0 || deselectedIDs.length > 0) {
                        const updateProteins = selectedIDs
                            .concat(deselectedIDs)
                            .filter((id) => id !== 'not found');
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
