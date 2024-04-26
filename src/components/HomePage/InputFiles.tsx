import {
    Container,
    Box,
    Typography,
    Alert,
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

} from '@mui/material';
import React from 'react';
import { selectedExampleAtom, uploadStatus } from '../../apiCalls';
import { useAtom } from 'jotai';

const InputFilesForm = (props) => {
    const [networkFile, setNetworkFile] = React.useState(null);
    const [nodesOfInterestFile, setNodesOfInterestFile] = React.useState(null);
    const [metadataFile, setMetadataFile] = React.useState(null);
    const [error, setError] = React.useState('');
    const [keyNodeName, setKeyNodeName] = React.useState('');
    const [keysMetadata, setKeysMetadata] = React.useState([]);
    const [keysTooltipInfo, setKeysTooltipInfo] = React.useState([]);
    const [keyClassification, setKeyClassification] = React.useState('');
    const [maxNodes, setMaxNodes] = React.useState(100);
    const [minCoverage, setMinCoverage] = React.useState(0.95);
    const [_dataProcess, setExampleChosen] = useAtom(selectedExampleAtom);
    const [_uploadingData, toggleUpload] = useAtom(uploadStatus);

    const handleMetadataParsing = (file) => {

        // Read only the first line of the file
        let reader = new FileReader();
        reader.onload = function (e) {
            let content = e.target.result;
            let lines = content.split('\n');
            let keys = lines[0].split(';');
            let keysMetadataTemp = keys.map((key) => {
                return { value: key, label: key };
            });
            setKeysMetadata(keysMetadataTemp);
        };
        reader.readAsText(file);
        setMetadataFile(file);

    }

    const handleChangeKeyClassification = (event) => {
        setKeyClassification(event.target.value);
    }
    const handleSubmit = (e) => {
        const formData = new FormData();
        formData.append('network', networkFile);
        formData.append('metadata', metadataFile);
        formData.append('nodes_interest', nodesOfInterestFile);
        formData.append('max_nodes', String(maxNodes));
        formData.append('min_coverage', String(minCoverage));
        formData.append('key_classification', keyClassification);
        formData.append('key_node_name', keyNodeName);
        // keysTooltipInfo.forEach((key) => {
        formData.append('keys_tooltip_info', JSON.stringify(keysTooltipInfo));
        // })
        toggleUpload();
        fetch('/api/process_input_data', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                setExampleChosen(data);
            })


    };


    // TODO 1. Check if all files are provided
    // TODO 2. Check if all files are in the correct format
    // TODO 3. Check if all nodes provided in the nodes of interest are in the network
    // TODO 4. Check if all nodes provided in the metadata are in the network

    return (
        <Container>
            {error.length > 1 ? (
                <List>

                    <ListItem>
                        <Alert severity={'warning'}>
                            Something went wrong.
                            <Box>{error}</Box>
                            Please check your input files!
                        </Alert>
                    </ListItem>
                </List>
            ) : null}

            <FormControl >

                <TextField onChange={(x) => setNetworkFile(x.target.files[0])} style={{ padding: "0.5em" }} id="network-file" type="file" required={true} label="Network file" InputLabelProps={{ shrink: true }} />
                <TextField onChange={(x) => setNodesOfInterestFile(x.target.files[0])} style={{ padding: "0.5em" }} id="nodes-interest" type="file" label="Nodes of interset" InputLabelProps={{ shrink: true }} />
                <TextField
                    id="max-nodes"
                    label="Max nodes"
                    type={'number'}
                    value={maxNodes}
                    onChange={(e) => setMaxNodes(parseInt(e.target.value))}
                    helperText="Please the maximal number of nodes to be considered for the overview"
                />
                <TextField
                    id="min-coverage"
                    label="Min. Edge Coverage"
                    type={'number'}
                    value={minCoverage}
                    onChange={(e) => setMinCoverage(parseFloat(e.target.value))}
                    helperText="Please the maximal number of nodes to be considered for the overview"
                    InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                />


                <TextField onChange={(x) => handleMetadataParsing(x.target.files[0])} style={{ padding: "0.5em" }} id="metadata-file" type="file" label="Metata file" InputLabelProps={{ shrink: true }} />
                {
                    keysMetadata.length > 0 ? (
                        <>
                            <TextField
                                id="select-key-classification"
                                select
                                label="Select key for classification"
                                value={keyClassification}
                                onChange={handleChangeKeyClassification}
                                helperText="Please select the column of the metadata for the classification of nodes"
                            >
                                {keysMetadata.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id="select-node-name"
                                select
                                label="Select key for node naming"
                                value={keyNodeName}
                                onChange={(e) => setKeyNodeName(e.target.value)}
                                helperText="Please select the column of the metadata used for naming the nodes"
                            >
                                {keysMetadata.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id="select-tooltip-info"
                                select
                                label="Select keys for disply in the tooltip"
                                value={keysTooltipInfo}
                                onChange={(e) => setKeysTooltipInfo(e.target.value)}
                                helperText="Please select the column of the metadata used for naming the nodes"
                                SelectProps={{ multiple: true }}
                            >
                                {keysMetadata.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </>
                    ) : null
                }

                <Button variant="contained" color="primary" component="span" onClick={handleSubmit}>
                    Upload
                </Button>

            </FormControl>


        </Container>
    );
};
export default InputFilesForm;
