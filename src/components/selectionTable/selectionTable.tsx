import {
    DataGrid,
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
    return (
        <div style={{ height: 400, width: '100%' }}>
            <DataGrid
                rows={tableData.rows}
                columns={tableData.columns}
                onRowSelectionModelChange={props.onRowSelectionModelChange}
            />
        </div>
    );
};

export default SelectionTable;
