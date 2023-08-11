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
    animatedParams: {opacity: number, transform:string };
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, animatedParams, color } = props;
    const [_, setDecollapseID] = useAtom(decollapseIDsAtom);
    return (
        <Tooltip title={id} key={id}>
            <animated.g key={id} transform={animatedParams.transform} opacity={animatedParams.opacity}>
                <circle
                    r={size}
                    fill={color}
                    stroke="black"
                    strokeWidth="1"
                    onClick={() => setDecollapseID(id)}
                />
                <circle
                    r={(size * 2) / 3}
                    fill={'none'}
                    stroke="black"
                    strokeWidth="1"
                />
                <circle
                    r={10}
                    fill={'black'}
                    stroke="black"
                    strokeWidth="1"
                />
            </animated.g>
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
