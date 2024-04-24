import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useAtom } from 'jotai';
import { ReactElement, useRef } from 'react';
import {
  Backdrop,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography
} from '@mui/material';
import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';
import { InformationVariantCircle } from 'mdi-material-ui';

interface DetailNodeLinkViewerProps {
  content: () => ReactElement
  title: string
  titleBarContent?: () => ReactElement
  titleBarContentCols?: number
  name: string
  infoContent: string
  busy: boolean
}

function DetailView(props: DetailNodeLinkViewerProps) {
  const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
  const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);

  const titleBarContent = props.titleBarContent ? props.titleBarContent : () => <></>;
  const titleBarContentCols = props.titleBarContentCols ? props.titleBarContentCols : 0;
  const titleCols = 11 - titleBarContentCols; 
  return (
      <div
      >
          <Backdrop
              sx={{
                  color: '#fff',
                  zIndex: (theme) => theme.zIndex.drawer - 1,
                  position: 'absolute'
              }}
              open={props.busy}
          >
              <CircularProgress color="inherit" />
          </Backdrop>
          <Grid
              container
              spacing={0}
              sx={{
                  top: 10,
                  width: '100%',
                  height: '100%',
              }}
          >
            <Grid xs={titleCols}>
                <Typography component={'span'} style={{ color: 'black' }}>
                    {props.title}
                </Typography>
            </Grid>
            <Grid xs={titleBarContentCols}>
                {titleBarContent()}
            </Grid>
            <Grid xs={1} >
                <IconButton
                    onClick={() => {
                        setInfoTitle(props.infoContent);
                        setInfoContent(props.infoContent);
                    }}
                >
                    <Tooltip title={`Information about the ${props.name}`}>
                        <InformationVariantCircle />
                    </Tooltip>
                  </IconButton>
              </Grid>
              <Grid xs={12}>
                    <props.content/>
              </Grid>
          </Grid>
      </div>
  );
}

export default DetailView;