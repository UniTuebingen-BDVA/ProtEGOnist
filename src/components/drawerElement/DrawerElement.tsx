import { Box, Drawer, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TabViewer from '../TabViewer/TabViewer.tsx';
import { useAtom } from 'jotai';
import {
    closeDrawerAtom,
    drawerShownAtom,
    isFullWidthAtom
} from './DrawerElementStore.ts';
import { InformationVariantCircle } from 'mdi-material-ui';
import { infoTitleAtom, infoContentAtom } from '../HomePage/InfoComponent.tsx';
import { useSetAtom } from 'jotai';

function DrawerElement() {
    const [drawerShown] = useAtom(drawerShownAtom);
    const [isFullWidth] = useAtom(isFullWidthAtom);
    const closeDrawer = useSetAtom(closeDrawerAtom);
    const [, setInfoTitle] = useAtom(infoTitleAtom);
    const [, setInfoContent] = useAtom(infoContentAtom);

    return (
        <Drawer
            variant={"persistent"}
            anchor="left"
            PaperProps={{
                sx: {
                    height: '90%',
                    top: '5%',
                    width: isFullWidth ? '90%' : '45%'
                }
            }}
            open={drawerShown}
            onClose={() => closeDrawer()}
        >
            <Box sx={{ padding: '0.5%' }} display="flex" alignItems="center">
                <Box flexGrow={1}>
                    <Typography component={'span'} variant="h6" color="inherit">
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
                    <IconButton onClick={() => closeDrawer()}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            </Box>

            <TabViewer />
        </Drawer>
    );
}

export default DrawerElement;
