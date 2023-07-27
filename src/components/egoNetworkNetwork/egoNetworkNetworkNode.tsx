import { Tooltip } from '@mui/material';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    x: number;
    y: number;
    color: string;
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, x, y, color } = props;

    return (
        <Tooltip title={id} key={id}>
            <circle
                key={id}
                r={size}
                cx={x}
                cy={y}
                fill={color}
                stroke="black"
                strokeWidth="1"
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
