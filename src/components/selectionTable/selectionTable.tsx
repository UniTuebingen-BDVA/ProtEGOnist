import {
    DataGrid,
    GridRowsProp,
    GridColDef,
    GridRowSelectionModel,
    GridCallbackDetails
} from '@mui/x-data-grid';

interface SelectionTableProps {
    data: {
        rows: GridRowsProp;
        columns: GridColDef[];
    };
    onRowSelectionModelChange: (
        rowSelectionModel: GridRowSelectionModel,
        details: GridCallbackDetails
    ) => void;
}

const SelectionTable = (props: SelectionTableProps) => {
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={props.data.rows}
                columns={props.data.columns}
                onRowSelectionModelChange={props.onRowSelectionModelChange}
            />
        </div>
    );
};

export default SelectionTable;
