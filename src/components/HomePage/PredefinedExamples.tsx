import {
    Container,
    TableContainer,
    Button,
    Table,
    TableHead,
    TableCell,
    Link,
    TableRow,
    TableBody
} from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import { selectedExampleAtom } from '../../apiCalls';
import { useAtom } from 'jotai';

const ExamplesPage = (_props) => {
    const [_dataProcess, setExampleChosen] = useAtom(selectedExampleAtom);
    return (
        <Container>
            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Dataset</TableCell>
                            <TableCell>Dataset Description</TableCell>
                            <TableCell>#Nodes</TableCell>
                            <TableCell>#Edges</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>IEEE VIS Co-Author Network</TableCell>
                            <TableCell>
                                Co-Author network where nodes represent authors
                                and edges co-authorships.
                            </TableCell>
                            <TableCell>6,619</TableCell>
                            <TableCell>22,220</TableCell>
                            <TableCell>
                                <Link
                                    target={'_blank'}
                                    rel={'noreferrer'}
                                    href="https://doi.org/10.1109/TVCG.2016.2615308"
                                >
                                    Isenberg et al., 2016
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Button
                                    startIcon={<HubIcon />}
                                    onClick={() => {
                                        setExampleChosen('IEEE');
                                    }}
                                >
                                    Select
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell> Full E. coli K12 PPI</TableCell>
                            <TableCell>
                                Protein Protein interaction network where nodes
                                represent proteins and edges interactions. All
                                proteins of E.coli K12 are contained.
                            </TableCell>
                            <TableCell>4,140</TableCell>
                            <TableCell>27,959</TableCell>
                            <TableCell>
                                <Link
                                    target={'_blank'}
                                    rel={'noreferrer'}
                                    href="https://doi.org/10.1093/nar/gku1003"
                                >
                                    {' '}
                                    Obtained from String (Szklarczyk et al,
                                    2015)
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Button
                                    startIcon={<HubIcon />}
                                    onClick={() => {
                                        setExampleChosen('ecoli');
                                    }}
                                >
                                    Select
                                </Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>DeeProM</TableCell>
                            <TableCell>
                                Protein Protein interaction network where nodes
                                represent proteins and edges interactions
                                originally provided for the Bio+MedVis Challenge
                                2023. The metadata includes drug-protein
                                associations identified using a deep learning
                                approach.
                            </TableCell>
                            <TableCell>8,395</TableCell>
                            <TableCell>66,721</TableCell>
                            <TableCell>
                                <Link
                                    target={'_blank'}
                                    rel={'noreferrer'}
                                    href="https://doi.org/10.1016/j.ccell.2022.06.010"
                                >
                                    {' '}
                                    Gonçalves et al., 2022
                                </Link>
                            </TableCell>
                            <TableCell>
                                <Button
                                    startIcon={<HubIcon />}
                                    onClick={() => {
                                        setExampleChosen('string');
                                    }}
                                >
                                    Select
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
};
export default ExamplesPage;
