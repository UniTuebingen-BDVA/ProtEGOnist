import {
    DataGrid,
    GridToolbar,
    GridRowSelectionModel,
    GridCallbackDetails
} from '@mui/x-data-grid';
import { useAtom } from 'jotai';
import { tableAtom } from './tableStore';

interface SelectionTableProps {
    onRowSelectionModelChange: (
        rowSelectionModel: GridRowSelectionModel,
        details: GridCallbackDetails
    ) => void;
}

const SelectionTable = (props: SelectionTableProps) => {
    const [tableData] = useAtom(tableAtom);
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
                onRowSelectionModelChange={props.onRowSelectionModelChange}
                rowHeight={40}
                disableDensitySelector
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
