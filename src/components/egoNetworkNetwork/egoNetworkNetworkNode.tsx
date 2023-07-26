import { Tooltip } from '@mui/material';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    x: number;
    y: number;
}

const EgoNetworkNetworkNode = (props: EgoNetworkNetworkNodeProps) => {
    const { id, size, x, y } = props;

    return (
        <Tooltip title={id} key={id}>
            <circle
                key={id}
                r={size}
                cx={x}
                cy={y}
                fill="red"
                stroke="black"
                strokeWidth="1"
            />
        </Tooltip>
    );
};

export default EgoNetworkNetworkNode;
