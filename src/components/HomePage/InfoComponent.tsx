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
    egoNetworkNetwork: 'Ego-graph Subnetwork',
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
                Each node in the ego-graph subnetwork corresponds to an
                ego-graph, i.e. the node and its respective neighbors of
                distance 1 and 2. The links connecting the nodes show the
                overlap of the respective ego-graph neighborhoods.
            </p>
            <p>
                <b>Click on</b> nodes or links to decollapse ego-graphs to show the
                detailed internal structure including all contained elements and
                their interactions. Similarly, collapse nodes by clicking on the
                ego-graphs.
            </p>
            <p>
                Groups of up to three connected ego-graphs can be decollapsed
                for a direct comparison. Within the groups bands show which
                elements are shared between the ego-graphs.
            </p>
            <p>
                <b>Click on</b> bands in groups of decollapsed ego-graphs to select
                them for detailed investigation using the selection table.
            </p>
            <p>
                <b>Right click on</b> ego-graphs to open a context-menu for node-deletion
                or to view them in the radar chart.
            </p>
        </div>
    ),
    radarChart: (
        <div>
            <p>
                The radar chart visualizes an ego-graph of interest and the its
                similarity to other ego-graphs. The 30 most similar
                ego-graphs are displayed.
            </p>
            <p><b>Click on</b> ego-graphs to change the center.</p>
            <p>
                <b>Right click on</b> ego-graphs to open a context-menu for adding
                ego-graphs to the ego-graph subnetwork.
            </p>
        </div>
    ),
    networkOverview: (
        <div>
            <p>
                The Network Overview contains potentially interesting
                ego-graphs. Elements from the input data set are chosen such
                that the highest abount of elements and interactions are
                contained in ego-graphs generated from the chosen elements.
            </p>
            <p>
                <b>Click on</b> ego-graphs (nodes) to add them to the ego-graph
                subnetwork and set them as center of the radar chart.
            </p>
            <p>
                <b>Right click on</b> ego-graphs to open a context-menu for adding
                ego-graphs to the ego-graph subnetwork or to view them in the radar chart.
            </p>
        </div>
    ),
    dataTable: (
        <div>
            <p>The Data Table contains information about all elements.</p>
            <p>
                <b>Use the checkboxes</b> to add elements to the ego-graph subnetwork
                or <b>click on the radar symbol</b> to place them as the center in the
                radar chart.
            </p>
        </div>
    ),
    protegonist: (
        <div>
            <p>
                The complexity of protein-protein interaction (PPI) networks
                often leads to visual clutter and limited interpretability. To
                overcome these problems, we present ProtEGOnist, a novel
                visualization tool designed to explore PPI networks with a focus
                on drug-protein associations. ProtEGOnist addresses the
                challenges using ego-graphs that represent local PPI
                neighborhoods around proteins of interest. These ego-graphs are
                arranged in an ego-graph network, where edges between ego-graphs
                encode their similarity using the Jaccard index. The tool offers
                an overview of drug-associated proteins, a radar chart to
                compare protein functions, and detailed ego-graph subnetworks
                for interactive exploration. Our design aims to reduce visual
                complexity while enabling detailed exploration, and facilitating
                the discovery of meaningful patterns in PPI networks. The ProtEGOnist
                approach can be applied to other data sets, e.g. social networks.
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
