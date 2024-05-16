import {
    Container,
    Box,
    Alert,
    Button,
    FormControl,
    List,
    ListItem,
    MenuItem,
    TextField,
    FormLabel,

} from '@mui/material';
import React from 'react';
import { selectedExampleAtom, uploadStatus } from '../../apiCalls';
import { useAtom } from 'jotai';


const InputFilesForm = (props) => {
    const [networkFile, setNetworkFile] = React.useState(null);
    const [nodesOfInterestFile, setNodesOfInterestFile] = React.useState(null);
    const [metadataFile, setMetadataFile] = React.useState(null);
    const [error, setError] = React.useState('');
    const [keyNodeName, setKeyNodeName] = React.useState('default');
    const [keysMetadata, setKeysMetadata] = React.useState(['default']);
    const [keysTooltipInfo, setKeysTooltipInfo] = React.useState([]);
    const [keyClassification, setKeyClassification] = React.useState('default');
    const [keytypeQuantification, setKeytypeQuantification] = React.useState('default');
    const [maxNodes, setMaxNodes] = React.useState(100);
    const [minCoverage, setMinCoverage] = React.useState(0.95);
    const [_dataProcess, setExampleChosen] = useAtom(selectedExampleAtom);
    const [_uploadingData, toggleUpload] = useAtom(uploadStatus);
    const [keyQuantification, setKeyQuantification] = React.useState('default');
    const typesQuantification = [
        { value: 'quantitative', label: 'Numerical values' },
        { value: 'categorical', label: 'Categorical' },
        { value: 'default', label: 'Numerical values' },
    ];


    const handleMetadataParsing = (file) => {

        // Read only the first line of the file
        let reader = new FileReader();
        reader.onload = function (e) {
            let content = e.target.result;
            let lines = content.split('\n');
            // get separator from header
            let header = lines[0];
            let separator = header.includes(';') ? ';' : header.includes(",") ? ',' : '\t';
            let keys = header.split(separator);
            let keysMetadataTemp = keys.map((key) => {
                return { value: key, label: key };
            });
            setKeysMetadata([...keysMetadataTemp, { "value": "default", "label": "default" }]);
        };
        reader.readAsText(file);
        setMetadataFile(file);

    }
    const handleChangeKeyQuantification = (event) => {
        setKeyQuantification(event.target.value);
    }

    const handleChangeKeyClassification = (event) => {
        setKeyClassification(event.target.value);
    }
    const handleSubmit = (e) => {
        const formData = new FormData();
        if (networkFile === null) {
            setError('Please provide a network file');
            return;
        }
        formData.append('network', networkFile);
        formData.append('metadata', metadataFile);
        formData.append('nodes_interest', nodesOfInterestFile);
        formData.append('max_nodes', String(maxNodes));
        formData.append('min_coverage', String(minCoverage));
        formData.append('key_quantification', keyQuantification);
        formData.append('keytype_quantification', keytypeQuantification);
        formData.append('key_classification', keyClassification);
        formData.append('key_node_name', keyNodeName);
        formData.append('keys_tooltip_info', JSON.stringify(keysTooltipInfo));
        toggleUpload();
        fetch('/api/process_input_data', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                // Check if the response is ok
                if (!response.ok) {
                    return 'Error';
                }
                return response.text();

            }

            )

            .then(data => {
                if (data !== 'Error') {

                    setExampleChosen(data);
                } else {
                    setError('Error');
                }
            })
            .catch((error) => {
                setError(error);
            });


    };


    // TODO 1. Check if all files are provided
    // TODO 2. Check if all files are in the correct format
    // TODO 3. Check if all nodes provided in the nodes of interest are in the network
    // TODO 4. Check if all nodes provided in the metadata are in the network

    return (
        <Container>
            {error.length > 1 ? (
                <List>

                    <ListItem key="error" >
                        <Alert style={{ "width": "50vw" }} severity={'warning'}>
                            Something went wrong.
                            <Box>{error}</Box>
                            Please check your input files!
                        </Alert>
                    </ListItem>
                </List>
            ) : null}

            <FormControl style={{ "width": "50vw" }}>
                <FormLabel className="titles-form">Network data</FormLabel>


                <TextField onChange={(x) => setNetworkFile(x.target.files[0])} id="network-file" type="file" required={true} label="Network file" InputLabelProps={{ shrink: true }} style={{ padding: "0.5em" }} />
                <FormLabel className="titles-form">Parameters for the computation of an overview visualization</FormLabel>

                <TextField
                    onChange={(x) => setNodesOfInterestFile(x.target.files[0])}
                    style={{ padding: "0.5em" }} id="nodes-interest" type="file" label="Nodes of interset" InputLabelProps={{ shrink: true }} />

                <TextField
                    id="max-nodes"
                    label="Max nodes"
                    type={'number'}
                    value={maxNodes}
                    style={{ padding: "0.5em" }}
                    onChange={(e) => setMaxNodes(parseInt(e.target.value))}
                    helperText="Please the maximal number of nodes to be considered for the overview"
                />
                <TextField
                    id="min-coverage"
                    label="Min. Edge Coverage"
                    type={'number'}
                    value={minCoverage}
                    style={{ padding: "0.5em" }}
                    onChange={(e) => setMinCoverage(parseFloat(e.target.value))}
                    helperText="Please the maximal number of nodes to be considered for the overview"
                    InputProps={{ inputProps: { min: 0, max: 1, step: 0.01 } }}
                />

                <FormLabel className="titles-form">Metadata</FormLabel>

                <TextField onChange={(x) => handleMetadataParsing(x.target.files[0])} style={{ padding: "0.5em" }} id="metadata-file" type="file" label="Metata file" InputLabelProps={{ shrink: true }} />
                {
                    metadataFile ? (
                        <>
                            <FormLabel className="subtitles-form">Metadata for the quantification of nodes</FormLabel>
                            <TextField
                                id="select-key-quantification"
                                select
                                label="Select key for node quantification"
                                value={keyQuantification}
                                onChange={handleChangeKeyQuantification}
                                style={{ padding: "0.5em" }}

                                helperText="Please select the column of the metadata for the quantification of nodes"
                            >
                                {keysMetadata.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id="select-keytype-quantification"
                                select
                                style={{ padding: "0.5em" }}

                                label="Select type of the key for node quantification"
                                value={keytypeQuantification}
                                onChange={(e) => setKeytypeQuantification(e.target.value)}
                                helperText="Please select the type of column of the metadata for the quantification of nodes"
                            >
                                {typesQuantification.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <FormLabel className="subtitles-form">Metadata for the Radar Chart classification</FormLabel>
                            <TextField
                                style={{ padding: "0.5em" }}

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

                            <FormLabel className="subtitles-form">Column with the name of the nodes</FormLabel>

                            <TextField
                                style={{ padding: "0.5em" }}

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
                            <FormLabel className="subtitles-form">Columns that are showed in the tooltip</FormLabel>

                            <TextField
                                style={{ padding: "0.5em" }}

                                id="select-tooltip-info"
                                select
                                label="Select keys for display in the tooltip"
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
