interface EgoNetworkNetworkEdgeProps {
    source: string;
    target: string;
    weight: number;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

const EgoNetworkNetworkEdge = (props: EgoNetworkNetworkEdgeProps) => {
    const { source, target, weight, x1, y1, x2, y2 } = props;

    return (
        <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="black"
            strokeWidth={weight * 20}
        />
    );
};

export default EgoNetworkNetworkEdge;
