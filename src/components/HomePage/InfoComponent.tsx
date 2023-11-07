// a MUI dialog component that displays information about the specific component depending on where is it called from

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from '@mui/material';
import { atom, useAtom } from 'jotai';

export const infoTitleAtom = atom('');
export const infoContentAtom = atom('');

const titles = {
    '': '',
    egoNetworkNetwork: 'Ego Network Network',
    radarChart: 'Radar Chart',
    networkOverview: 'Network Overview',
    dataTable: 'Data Table',
    protegonist: 'Protegonist'
};

const contents = {
    '': '',
    egoNetworkNetwork: (
        <div>
            <p>
                The Ego Network Network is a visualization of the ego networks
                of the entity of interest. The ego networks are visualized as
                networks, where the entity of interest are the center nodes. The
                entity that are connected to the entity of interest are the
                first neighbors, the entity that are connected to the first
                neighbors are the second neighbors, and so on. The entity of
                interest are the center nodes of the ego networks.
            </p>
            <p>
                The entity of interest are colored according to the color legend
                on the right side. The entity that are connected to the entity
                of interest are colored according to the color legend on the
                left side. The entity that are connected to the first neighbors
                are colored according to the color legend on the left side.
            </p>
        </div>
    ),
    radarChart: (
        <div>
            <p>
                The Radar Chart is a visualization of the intersection of the
                ego networks of the entity of interest. The ego networks are
                visualized as networks, where the entity of interest are the
                center nodes.
            </p>
        </div>
    ),
    networkOverview: (
        <div>
            <p>
                The Network Overview is a visualization of the intersection of
                the ego networks of the entity of interest. The ego networks are
                visualized as networks, where the entity of interest are the
                center nodes.
            </p>
        </div>
    ),
    dataTable: (
        <div>
            <p>
                The Data Table is a table that contains the information about
                the entity of interest.
            </p>
        </div>
    ),
    protegonist: (
        <div>
            <p>
                ProtEGOnist is a new visualization tool that allows users to
                explore large networks by using an approach based on ego
                networks.
            </p>
        </div>
    )
};

export const InfoComponent = () => {
    const [infoTitle, setInfoTitle] = useAtom(infoTitleAtom);
    const [infoContent, setInfoContent] = useAtom(infoContentAtom);
    return (
        <Dialog
            open={infoContent != ''}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">
                {titles[infoTitle]}
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    {contents[infoContent]}
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setInfoContent('');
                        setInfoTitle('');
                    }}
                    autoFocus
                >
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
