import {
    Container,
    Box,
    Typography,
    Alert,
    Backdrop,
    Button,
    CircularProgress,
    createStyles,
    FormControl,
    FormControlLabel,
    InputLabel,
    List,
    ListItem,
    ListSubheader,
    makeStyles,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    Switch,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Theme,
    createTheme
} from '@mui/material';
import { GitHub, Help } from '@mui/icons-material';
import React from 'react';
const InputFilesForm = (props) => {
    let allFilesChosen = true;
    let notFoundNodes = ['BAD', 'BAD2'];
    const [networkFile, setNetworkFile] = React.useState(null);
    const [allNodes, setAllNodes] = React.useState(new Set());
    const [nodesOfInterestFile, setNodesOfInterestFile] = React.useState(
        null
    );
    const [metadataFile, setMetadataFile] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isError, setError] = React.useState(false);
    // TODO 1. Check if all files are provided
    // TODO 2. Check if all files are in the correct format
    // TODO 3. Check if all nodes provided in the nodes of interest are in the network
    // TODO 4. Check if all nodes provided in the metadata are in the network

    return (
        <Container>
            <List>
                {isError ? (
                    <ListItem>
                        <Alert severity={'warning'}>
                            Something went wrong. The following nodes were not
                            found in the given network.
                            <Box>{notFoundNodes.join(', ')}</Box>
                            Please check your input files!
                        </Alert>
                    </ListItem>
                ) : null}
                <ListItem>
                    <Typography>
                        Network in form of Interaction file
                        <Tooltip
                            title={
                                'All networks should be provided as a TSV file with all undirected interactions between nodes. Each line consists of two nodes and a value '
                            }
                        >
                            <Help />
                        </Tooltip>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography>
                        <Button
                            variant="contained"
                            component="label"
                            size="small"
                        >
                            Select Interaction File
                            <input
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                    console.log(event);
                                }}
                            />
                        </Button>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography>
                        Nodes of interest
                        <Tooltip
                            title={
                                'Using these nodes, ProtEGOnist will try to use the minimal set of EGO-groups to provide an overview of the data'
                            }
                        >
                            <Help />
                        </Tooltip>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography>
                        <Button
                            variant="contained"
                            size="small"
                            // disabled={isLoading}
                            component="label"
                        >
                            Select nodes of interest
                            <input
                                type="file"
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                    let filePath = event.target.files[0]

                                    setAllNodes(responseNodes)

                                }
                                }
                            />
                        </Button>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography>
                        Metadata on the nodes
                        <Tooltip
                            title={
                                'By providing metadata, you can explore different the classes of the most similar EGO-groups with respect of the classes you provide'
                            }
                        >
                            <Help />
                        </Tooltip>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography>
                        <Button
                            variant="contained"
                            size="small"
                            component="label"
                        >
                            Select Classification of nodes
                            <input
                                type="file"
                                multiple
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                    console.log(event);
                                }}
                            />
                        </Button>
                    </Typography>
                </ListItem>
            </List>

            {allFilesChosen && !isError ?
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                        console.log('Start');

                    }}
                >
                    Explore
                </Button> : null}
        </Container>
    );
};
export default InputFilesForm;
