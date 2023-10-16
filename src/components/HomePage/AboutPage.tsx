import {
    Container,
    Link,
    Typography, 
    Alert

} from "@mui/material";
import { GitHub, } from '@mui/icons-material';



const AboutPage = (props) => {
    return (
        <Container>
       
        <Typography>
            ProtEGOnist is a new visualization tool that allows users to explore large networks by using an approach based on ego networks. The input for proteonist is the following: 
        </Typography>
        <ol>
            <li> A network in the form of an edge list (csv file) </li>
            <li> A list of proteins of interest (csv file) </li>
            <li> A metadata file including all nodes (csv file) and at least one categorical class where each node is found </li>
            
            
        </ol>
        <Typography variant={"subtitle1"}>More information:
            <Link href="https://tuevis.cs.uni-tuebingen.de/protegonist/" target="_blank"
                  rel="noopener noreferrer"
                  style={{marginRight: "10px"}}>https://tuevis.cs.uni-tuebingen.de/protegonist/</Link>
            <Link href="https://github.com/UniTuebingen-BDVA/ProtEGOnist" 
                  target="_blank" rel="noopener noreferrer">
                <GitHub/>
            </Link>
        </Typography>
        <Alert severity={"info"}>Looking for examples? Get started 
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
)
}
export default AboutPage;