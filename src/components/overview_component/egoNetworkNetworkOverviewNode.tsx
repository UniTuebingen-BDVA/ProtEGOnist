import { Tooltip } from '@mui/material';
import { animated } from '@react-spring/web';
import { useAtom } from 'jotai';
import { selectedProteinsAtom } from '../selectionTable/tableStore';
import { getRadarAtom } from '../../apiCalls';
import { get } from 'optics-ts';

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
    return (
        <Tooltip title={id} key={id}>
            <animated.circle
                key={id}
                r={size}
                cx={x}
                cy={y}
                fill={color}
                opacity={1}
                stroke="black"
                strokeWidth="1"
                onClick={() => {
                    getRadarData(id);
                    setSelectedProteins([...selectedProteins, id])}}
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
