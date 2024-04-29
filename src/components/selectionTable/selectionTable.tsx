import { DataGrid, GridToolbar, GridFilterModel, GridValidRowModel } from '@mui/x-data-grid';
import { useAtom, useAtomValue } from 'jotai';
import {
    selectedProteinsAtom,
    tableAtom,
    columnVisibilityAtom,
    tableModelSelectedAtom
} from './tableStore';
import { Box, Typography } from '@mui/material';
import { startDataOverview } from '../../apiCalls';
import { selectedNodesAtom } from '../egoNetworkNetwork/egoNetworkNetworkStore.ts';
import { useMemo } from 'react';

const SelectionTable = () => {
    const [tableData] = useAtom(tableAtom);
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [selectedNodes] = useAtom(selectedNodesAtom);
    const tableModel = useAtomValue(tableModelSelectedAtom);
    const [columnVisibility, setColumnVisibility] =
        useAtom(columnVisibilityAtom);
    const rows = useMemo(() => Object.entries(tableData.rows).map(([key, value], index) => {
        return { ...value, nodeID: key, ID: index };
    }), [tableData.rows]);

    const initFilterModel: GridFilterModel = {
        items: [
            { id: 1, field: 'with_metadata', operator: 'equals', value: 'true' }
        ]
    };
    const columns = useMemo(() => [
        ...tableData.columns,
        {
            field: 'selected_for_subnetwork',
            headerName: 'Ego in Subnetwork',
            width: 100,
            valueGetter: (_value, row: GridValidRowModel) => {
                return (selectedProteins.includes(row.nodeID) ? 'Yes' : 'No')
            }
        },
        {
            field: 'found_in_overview_graph',
            headerName: 'Found in Overview',
            width: 100,
            valueGetter: (_value, row) =>
                startDataOverview.includes(row.nodeID) ? 'Yes' : 'No'
        },
        {
            field: 'found_in_selected_band_or_ego',
            headerName: 'Selected',
            width: 100,
            valueGetter: (_value, row) =>
                selectedNodes.includes(row.nodeID) ? 'Yes' : 'No'
        }
    ], [selectedNodes, selectedProteins, tableData.columns]);

    return (
        <Box style={{ maxWidth: '100%', width: '100%', height: '100%' }}>
            <Typography
                component={'span'}
                variant="subtitle2"
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
