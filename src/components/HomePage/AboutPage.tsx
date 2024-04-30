import { Container, Link, Typography, Alert } from '@mui/material';
import { GitHub } from '@mui/icons-material';

const AboutPage = (props) => {
    return (
        <Container>
            <Typography component={'span'}>
                ProtEGOnist is a new visualization tool that allows users to
                explore large networks by using an approach based on ego
                networks. The input for ProtEGOnist is the following:
            </Typography>
            <ol>
                <li> A network in the form of an edge list (tsv file) or a GraphML file</li>
                <li> (optional) A list of proteins of interest (txt file) that have to be shown in the overview. This should be a small set, since ProtEGOnist is going to compute an set that maximizes edge coverage.</li>
                <li>
                    (optional) A metadata file including all nodes (csv file). It should include one categorical column that can be used to shows division in the Radar Chart and either a numerical or a categorical column (i.e. elements divided by semicolons ) to quantify each node.
                </li>
            </ol>
            <Typography component={'span'} variant={'subtitle1'}>
                More information:
                <Link
                    href="https://tuevis.cs.uni-tuebingen.de/protegonist/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ marginRight: '10px' }}
                >
                    https://tuevis.cs.uni-tuebingen.de/protegonist/
                </Link>
                <Link
                    href="https://github.com/UniTuebingen-BDVA/ProtEGOnist"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <GitHub />
                </Link>
            </Typography>
            <Alert severity={'info'}>
                Looking for examples? Get started&nbsp;
                <Link
                    component="button"
                    variant="body2"
                    onClick={() => {
                        props.setTab(2);
                    }}
                >
                    here
                </Link>
            </Alert>
        </Container>
    );
};
export default AboutPage;
