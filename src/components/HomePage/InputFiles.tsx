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
import { Help } from '@mui/icons-material';
import React from 'react';
import axios from 'axios';
import { selectedExampleAtom } from '../../apiCalls';
import { useAtom } from 'jotai';

const InputFilesForm = (props) => {
    let allFilesChosen = true;
    const [dataProcess, setDataProcess] = useAtom(selectedExampleAtom);
    const [networkFile, setNetworkFile] = React.useState(null);
    const [allNodes, setAllNodes] = React.useState(new Set());
    const [nodesOfInterestFile, setNodesOfInterestFile] = React.useState(null);
    const [notFoundNodes, setNotFoundNodes] = React.useState(new Set());
    const [metadataFile, setMetadataFile] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    // TODO 1. Check if all files are provided
    // TODO 2. Check if all files are in the correct format
    // TODO 3. Check if all nodes provided in the nodes of interest are in the network
    // TODO 4. Check if all nodes provided in the metadata are in the network

    return (
        <Container>
            <List>
                {error.length > 1 ? (
                    <ListItem>
                        <Alert severity={'warning'}>
                            Something went wrong.
                            <Box>{error}</Box>
                            Please check your input files!
                        </Alert>
                    </ListItem>
                ) : null}
                <ListItem>
                    <Typography component={'span'}>
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
                    <Typography component={'span'}>
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
                                    const formData = new FormData();
                                    let filePath = event.target.files[0];
                                    formData.append('network', filePath);
                                    axios
                                        .post('/api/ParseNetwork/', formData)
                                        .then((response) => {
                                            let allNodesTemp = new Set(
                                                response.data
                                            );
                                            setAllNodes(allNodesTemp);
                                            if (nodesOfInterestFile !== null) {
                                                // Get intersection with all nodes
                                                let notFound = new Set(
                                                    [
                                                        ...nodesOfInterestFile
                                                    ].filter(
                                                        (x) =>
                                                            !allNodesTemp.has(x)
                                                    )
                                                );
                                                if (notFound.size > 0) {
                                                    // Raise error
                                                    // setNotFoundNodes(notFound)
                                                    let notFoundNodesString =
                                                        Array.from(
                                                            notFound
                                                        ).reduce(
                                                            (node, curr) =>
                                                                curr +
                                                                ', ' +
                                                                node,
                                                            ''
                                                        );
                                                    let erroMessage = `The following nodes were not found in the given network: ${notFoundNodesString}`;
                                                    setError(erroMessage);
                                                } else {
                                                    setError('');
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                            setError(error);
                                        });
                                }}
                            />
                        </Button>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography component={'span'}>
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
                    <Typography component={'span'}>
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
                                    const formData = new FormData();
                                    let filePath = event.target.files[0];
                                    formData.append('nodesInterest', filePath);
                                    axios
                                        .post(
                                            '/api/ParseNodesInterest/',
                                            formData
                                        )
                                        .then((response) => {
                                            let nodesParsed = response.data;
                                            setNodesOfInterestFile(nodesParsed);
                                            // Get intersection with all nodes
                                            if (allNodes.size > 0) {
                                                let notFound = new Set(
                                                    [...nodesParsed].filter(
                                                        (x) => !allNodes.has(x)
                                                    )
                                                );
                                                if (notFound.size > 0) {
                                                    // Raise error
                                                    let notFoundNodesString =
                                                        Array.from(
                                                            notFound
                                                        ).reduce(
                                                            (node, curr) =>
                                                                curr +
                                                                ', ' +
                                                                node,
                                                            ''
                                                        );
                                                    let erroMessage = `The following nodes were not found in the given network: ${notFoundNodesString}`;
                                                    setError(erroMessage);
                                                } else {
                                                    setError('');
                                                }
                                            }
                                        })
                                        .catch((error) => {
                                            console.error(error);
                                            setError(error);
                                        });
                                }}
                            />
                        </Button>
                    </Typography>
                </ListItem>
                <ListItem>
                    <Typography component={'span'}>
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
                    <Typography component={'span'}>
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
                                onChange={(event) => {}}
                            />
                        </Button>
                    </Typography>
                </ListItem>
            </List>

            {allFilesChosen && error.length == 0 ? (
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                        console.log('Start');
                        setDataProcess('string');
                    }}
                >
                    Explore
                </Button>
            ) : null}
        </Container>
    );
};
export default InputFilesForm;
