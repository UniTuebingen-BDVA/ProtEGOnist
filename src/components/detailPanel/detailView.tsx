import Grid from '@mui/material/Unstable_Grid2'; // Grid version 2
import { useAtom, useSetAtom } from 'jotai';
import { ReactElement, useEffect, useRef } from 'react';
import {
    Backdrop,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography
} from '@mui/material';
import { infoContentAtom, infoTitleAtom } from '../HomePage/InfoComponent.tsx';
import { InformationVariantCircle } from 'mdi-material-ui';
import { detailedSVGSizeAtom, resizeEffect } from '../../uiStore.tsx';

interface DetailNodeLinkViewerProps {
    children?: React.ReactNode;
    title: string;
    titleBarContent?: () => ReactElement;
    titleBarContentCols?: number;
    name: string;
    infoContent: string;
    busy: boolean;
    contentOutsideGrid?: boolean; // default is false
}

function DetailView(props: DetailNodeLinkViewerProps) {
    const [_infoContent, setInfoContent] = useAtom(infoContentAtom);
    const [_infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const setSvgSize = useSetAtom(detailedSVGSizeAtom);
    const containerRef = useRef<HTMLDivElement>();

    const titleBarContent = props.titleBarContent
        ? props.titleBarContent
        : () => <></>;
    const titleBarContentCols = props.titleBarContentCols
        ? props.titleBarContentCols
        : 0;
    const titleCols = 11 - titleBarContentCols;
    const contentOutsideGrid = props.contentOutsideGrid
        ? props.contentOutsideGrid
        : false;
    const gridContent = contentOutsideGrid
        ? () => <></>
        : () => (
              <Grid xs={12} sx={{ height: '100%' }}>
                  {props.children}
              </Grid>
          );
    const outsideGridContent = contentOutsideGrid
        ? () => props.children
        : () => <></>;
    useEffect(() => {
        resizeEffect(containerRef, setSvgSize);
    }, [setSvgSize]);
    return (
        <>
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
            {outsideGridContent()}
            <Grid
                container
                spacing={0}
                sx={{ height: '100%' }}
                ref={containerRef}
            >
                <Grid xs={titleCols}>
                    <Typography component={'span'} style={{ color: 'black' }}>
                        {props.title}
                    </Typography>
                </Grid>
                <Grid xs={titleBarContentCols}>{titleBarContent()}</Grid>
                <Grid xs={1} xsOffset="auto">
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
                {gridContent()}
            </Grid>
        </>
    );
}

export default DetailView;
