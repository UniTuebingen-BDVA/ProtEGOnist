import {
    DataGrid,
    GridToolbar,
    GridRowSelectionModel,
    GridCallbackDetails
} from '@mui/x-data-grid';
import { useAtom } from 'jotai';
import { tableAtom } from './tableStore';
import { getEgoNetworkNetworkAtom } from '../../apiCalls';

const SelectionTable = () => {
    const [tableData] = useAtom(tableAtom);
    const [_egoNetworkNetworkData, getEgoNetworkNetworkData] = useAtom(
        getEgoNetworkNetworkAtom
    );
    const rows = tableData.rows;
    const columns = tableData.columns;
    return (
        <div style={{ maxWidth: '100%', width: '100%', maxHeight: '100%' }}>
            <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: 5 }
                    }
                }}
                pageSizeOptions={[5]}
                rowHeight={40}
                checkboxSelection
                disableRowSelectionOnClick
                disableDensitySelector
                onRowSelectionModelChange={(selection) => {
                    // when the model changes, we need to update the network data
                    // for this we call getEgoNetworkNetworkData with the IDs of the selected rows
                    const selectedIDs = selection.map(
                        (id) => rows[id]['UniprotID_inString']
                    );
                    if (selectedIDs.length > 0) {
                        getEgoNetworkNetworkData(selectedIDs);
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
            />
        </div>
    );
};

export default SelectionTable;
