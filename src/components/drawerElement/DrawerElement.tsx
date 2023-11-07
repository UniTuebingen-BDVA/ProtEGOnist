import { Box, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TabViewer from '../TabViewer/TabViewer.tsx';
import { useAtom } from 'jotai';
import { drawerShownAtom } from './DrawerElementStore.ts';
import { InformationVariantCircle } from 'mdi-material-ui';
import { infoTitleAtom, infoContentAtom } from '../HomePage/InfoComponent.tsx';

function DrawerElement() {
    const [state, setState] = useAtom(drawerShownAtom);
    const [, setInfoTitle] = useAtom(infoTitleAtom);
    const [, setInfoContent] = useAtom(infoContentAtom);

    return (
        <Drawer
            anchor="left"
            PaperProps={{
                sx: {
                    height: '90%',
                    top: '5%',
                    width: '90%'
                }
            }}
            open={state}
            onClose={() => setState(false)}
        >
            <Box sx={{ padding: '0.5%' }} display="flex" alignItems="center">
                <Box flexGrow={1}>
                    <Typography
                        component={'span'}
                        variant="h6"
                        color="inherit"
                        component="div"
                    >
                        Select input data for visualization
                    </Typography>
                </Box>
                <Box>
                    <IconButton
                        onClick={() => {
                            setInfoTitle('dataTable');
                            setInfoContent('dataTable');
                        }}
                    >
                        <Tooltip title="Information about the data table">
                            <InformationVariantCircle />
                        </Tooltip>
                    </IconButton>
                    <IconButton onClick={() => setState(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            <TabViewer />
        </Drawer>
    );
}

export default DrawerElement;
