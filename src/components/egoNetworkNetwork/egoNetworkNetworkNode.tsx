import { Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { decollapseIDsAtom } from './egoNetworkNetworkStore';
import { animated } from '@react-spring/web';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    x: number;
    y: number;
    color: string;
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, x, y, color } = props;
    const [_, setDecollapseID] = useAtom(decollapseIDsAtom);
    return (
        <Tooltip title={id} key={id}>
            <animated.circle
                key={id}
                r={size}
                cx={x}
                cy={y}
                fill={color}
                stroke="black"
                strokeWidth="1"
                onClick={() => setDecollapseID(id)}
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
