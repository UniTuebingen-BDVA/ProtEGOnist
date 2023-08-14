interface EgoNetworkNetworkEdgeProps {
    weight: number;
    opacity: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { weight, x1, x2, y1, y2 } = props;
    return (
        <line
            opacity={weight}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth={weight * 10}
        />
    );
};

export default EgoNetworkNetworkEdge;
