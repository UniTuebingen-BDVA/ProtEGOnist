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
  name: string
  infoContent: string
  busy: boolean
  contentSize: { width: number, height: number, percentWidth: number }
}

function DetailView(props: DetailNodeLinkViewerProps) {
  const ref = useRef(null);
  const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
  const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);

  return (
      <div
          ref={ref}
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
              <Grid xs={11}>
                  <Typography component={'span'} style={{ color: 'black' }}>
                      {props.title}
                  </Typography>
              </Grid>
              <Grid xs={1} sx={{ display: 'flex' }}>
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
                  <svg
                      width={props.contentSize.percentWidth + '%'}
                      viewBox={`0 0 ${props.contentSize.width} ${props.contentSize.height}`}
                  >
                      <g
                          // transform={
                          //     'translate(' +
                          //     String(props.contentSize.width / 2) +
                          //     ',' +
                          //     String(props.contentSize.height / 2) +
                          //     ')'
                          // }
                      >
                          <props.content/>
                      </g>
                  </svg>
              </Grid>
          </Grid>
      </div>
  );
}

export default DetailView;