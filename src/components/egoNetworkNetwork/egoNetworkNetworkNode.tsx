import { useAtom } from 'jotai';
import { decollapseIDsAtom } from './egoNetworkNetworkStore';
import { animated } from '@react-spring/web';
import AdvancedTooltip from '../advancedTooltip/advancedTooltip';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: string;
    x: number;
    y: number;
    animatedParams: { opacity: number; transform: string };
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, animatedParams, color } = props;
    const [_, setDecollapseID] = useAtom(decollapseIDsAtom);
    return (
        <AdvancedTooltip uniprotID={id} key={id}>
            <animated.g
                key={id}
                transform={animatedParams.transform}
                opacity={animatedParams.opacity}
                onClick={() => setDecollapseID(id)}
            >
                <circle r={size} fill={color} stroke="black" strokeWidth="1" />
                <circle
                    r={(size * 2) / 3}
                    fill={'none'}
                    stroke="black"
                    strokeWidth="1"
                />
                <circle
                    r={size * 0.05 > 1 ? size * 0.05 : 1}
                    opacity={0.75}
                    fill={'black'}
                    stroke="black"
                    strokeWidth="1"
                />
            </animated.g>
        </AdvancedTooltip>
    );
};

export default EgoNetworkNetworkNode;
