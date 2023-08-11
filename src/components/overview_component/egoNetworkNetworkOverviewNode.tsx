import { Tooltip } from '@mui/material';
import { animated } from '@react-spring/web';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: string;
    x: number;
    y: number;
    opacity: number;
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { x,y,id, size,  color, opacity} = props;
    return (
        <Tooltip title={id} key={id}>
            <animated.circle
                key={id}
                r={size}
                cx={x}
                cy={y}
                fill={opacity === 1? "yellow" :color}
                opacity={opacity}
                stroke="black"
                strokeWidth="1"
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
