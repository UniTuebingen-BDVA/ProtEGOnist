import { Box, Drawer, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import TabViewer from '../TabViewer/TabViewer.tsx';
import { useAtom } from 'jotai';
import { drawerShownAtom } from './DrawerElementStore.ts';



function DrawerElement() {
    const [state, setState] = useAtom(drawerShownAtom);

    return (
        <Drawer anchor='left' PaperProps={{
            sx: {
              height: '90%',
              top: "5%",
              width: '90%',
            },
          }}
        open={state}
        onClose={()=> setState(false)}>
            <Box sx={{padding:"0.5%"}} display="flex" alignItems="center">
                <Box flexGrow={1} >
                <Typography
                                        variant="h6"
                                        color="inherit"
                                        component="div"
                                    >
                                        Select input data for visualization
                                    </Typography></Box>
                <Box>
                    <IconButton onClick={() =>setState(false)}>
                          <CloseIcon />
                    </IconButton>
                </Box>
          </Box>
            
            <TabViewer/>

            
        </Drawer>
    );
}

export default DrawerElement;
