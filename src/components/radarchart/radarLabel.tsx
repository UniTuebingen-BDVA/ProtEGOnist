import { Tooltip } from '@mui/material';

interface radarLabelProps {
    startAngle: number;
    endAngle: number;
    label: string;
    hoverLabel: string;
    radius: number;
    color: string;
}

// given radarLabel props draw an arc and a text label along the arc
// if the arc is on the bottom half of the circle, flip the text label upside down
const RadarLabel = (props: radarLabelProps) => {
    const { startAngle, endAngle, label, hoverLabel, radius, color } = props;
    const midAngle = (startAngle + endAngle) / 2;
    const flipLabel = midAngle > 0 && midAngle < Math.PI;

    const startAltered = startAngle - Math.PI / 4;
    const endAltered = endAngle + Math.PI / 4;

    // draw the arc from startAngle to endAngle clockwise
    // center the text label such that it is centered along the arc

    const arc = `M ${Math.cos(startAltered) * radius} ${
        Math.sin(startAltered) * radius
    } A ${radius} ${radius} 0 0 1 ${Math.cos(endAltered) * radius} ${
        Math.sin(endAltered) * radius
    }`;
    return (
        <g>
            <path d={arc} fill="none" id={`${label}Arc`} />
            <Tooltip title={hoverLabel} key={hoverLabel}>
                <text fill={color}>
                    <textPath
                        fontSize="14px"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        xlinkHref={`#${label}Arc`}
                        fill={color}
                        startOffset={'50%'}
                    >
                        {label}
                    </textPath>
                </text>
            </Tooltip>
        </g>
    );
};

export default RadarLabel;
