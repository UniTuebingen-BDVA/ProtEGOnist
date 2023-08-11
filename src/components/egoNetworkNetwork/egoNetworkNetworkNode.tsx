import { Tooltip } from '@mui/material';
import { useAtom } from 'jotai';
import { decollapseIDsAtom } from './egoNetworkNetworkStore';
import { animated } from '@react-spring/web';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: string;
    x: number;
    y: number;
    decollapsePossible: boolean;
    animatedParams: { x: number; y: number; opacity: number };
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, animatedParams, color, decollapsePossible } = props;
    const [_, setDecollapseID] = useAtom(decollapseIDsAtom);
    return (
        <Tooltip title={id} key={id}>
            <animated.circle
                key={id}
                r={size}
                cx={animatedParams.x}
                cy={animatedParams.y}
                opacity={animatedParams.opacity}
                fill={color}
                stroke="black"
                strokeWidth="1"
                onClick={() => decollapsePossible ? setDecollapseID(id): null}
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
