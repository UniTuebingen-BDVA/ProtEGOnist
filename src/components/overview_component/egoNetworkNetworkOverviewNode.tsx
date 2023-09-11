import { memo } from 'react';
import { Graphics } from '@pixi/react';

interface EgoNetworkNetworkNodeProps {
    id: string;
    size: number;
    color: number;
    x: number;
    y: number;
}

const EgoNetworkNetworkNode = memo(function EgoNetworkNetworkNode(
    props: EgoNetworkNetworkNodeProps
) {
    const { x, y, id, size, color } = props;

    return (
        <Graphics
            x={x}
            y={y}
            interactive
            pointerdown={() => {
                // Handle click event
            }}
            pointerover={() => {
                // Handle mouseover event
            }}
            pointerout={() => {
                // Handle mouseout event
            }}
            draw={(g) => {
                // Draw the node shape
                g.beginFill(color);
                g.drawCircle(0, 0, size);
                g.endFill();

                // Draw the inner circle
                g.lineStyle(1, 0x000000);
                g.drawCircle(0, 0, (size * 2) / 3);

                // Draw the center dot
                g.beginFill(0x000000);
                g.drawCircle(0, 0, size * 0.05 > 1 ? size * 0.05 : 1);
                g.endFill();
            }}
        />
    );
});

export default EgoNetworkNetworkNode;
