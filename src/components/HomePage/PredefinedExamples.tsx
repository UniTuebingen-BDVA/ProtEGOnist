import {
    Container,
    Button,
    List,
    ListItem,
} from '@mui/material';
import { selectedExampleAtom } from '../../apiCalls';
import { useAtom } from 'jotai';

const ExamplesPage = (_props) => {
    const [_dataProcess, setExampleChosen] = useAtom(selectedExampleAtom);
    return (
        <Container>
            <List>
                <ListItem>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                            setExampleChosen("string")
                        }}
                    >
                        Example One: Visualizing PPIs
                    </Button>
                </ListItem>
                <ListItem>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                            setExampleChosen("string_modified")
                        }}
                    >
                        Example Two: Modified example of PPIs
                    </Button>
                </ListItem>
                <ListItem>
                    <Button
                        variant="contained"
                        size="small"
                        onClick={(e) => {
                            setExampleChosen("metagenome")
                        }}
                    >
                        Example Three: Correlation Network Metagenome
                    </Button>
                </ListItem>
            </List>
        </Container>
    );
};
export default ExamplesPage;
