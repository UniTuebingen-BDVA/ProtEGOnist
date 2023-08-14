import { Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import { getRadarAtom } from '../../apiCalls';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: string | number;
    x: number;
    y: number;
}



const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const [selectedProteins, setSelectedProteins] =
        useAtom(selectedProteinsAtom);
    const [_intersectionData, getRadarData] = useAtom(getRadarAtom);
    
    const { x,y,id, size,  color} = props;
    const transform = `translate(${x}, ${y})`;
    return (
        <Tooltip title={id} key={id} >
            <g key={id } transform={transform} onClick={() => {
                    getRadarData(id);
                    setSelectedProteins([id])}}>
                <circle
                    r={size}
                    fill={color}
                    stroke="black"
                    strokeWidth="1"
                />
                <circle
                    r={(size * 2) / 3}
                    fill={'none'}
                    stroke="black"
                    strokeWidth="1"
                />
                <circle
                    r={size*0.05>1?size*0.05:1}
                    opacity={0.75}
                    fill={'black'}
                    stroke="black"
                    strokeWidth="1"
                />
            </g>
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
