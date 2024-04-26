// import { PrimitiveAtom, useAtom } from 'jotai';
import { useAtom, useSetAtom } from 'jotai';
import { hoveredLabelAtom, labelsAtoms } from './radarStore';
import { memo } from 'react';
import { svgFontSize } from '../../../UtilityFunctions.ts';

interface radarLabelProps {
    startAngle: number;
    endAngle: number;
    // labelAtom: PrimitiveAtom<{ value: string; short: string; long: string }>;
    label: string;
    hoverLabel: string;
    guideCircleRadius: number;
    radius: number;
    colorScale: d3.ScaleOrdinal<string, string>;
}

// given radarLabel props draw an arc and a text label along the arc
// if the arc is on the bottom half of the circle, flip the text label upside down
const RadarLabel = memo(function RadarLabel(props: radarLabelProps) {
    const {
        startAngle,
        endAngle,
        label,
        hoverLabel,
        guideCircleRadius,
        radius,
        colorScale
    } = props;
    const arcLengthUnaltered = endAngle - startAngle;
    const labelOffset = arcLengthUnaltered > Math.PI ? 0 : Math.PI / 4;
    const midAngle = (startAngle + endAngle) / 2;
    const flipLabel = midAngle > 0 && midAngle < Math.PI;
    const startAltered = startAngle - labelOffset;
    const endAltered = endAngle + labelOffset;
    const arcLength = endAltered - startAltered;
    const largeArcFlag =
        arcLength > Math.PI ? (flipLabel ? 0 : 1) : flipLabel ? 1 : 0;
    const setHoveredLabel = useSetAtom(hoveredLabelAtom);
    const [labels]=useAtom(labelsAtoms);
    // draw the arc from startAngle to endAngle clockwise
    // center the text label such that it is centered along the arc
    let arc = '';
    if (!flipLabel) {
        arc = `M ${Math.cos(startAltered) * radius} ${
            Math.sin(startAltered) * radius
        } A ${radius} ${radius} 0 ${largeArcFlag} 1 ${
            Math.cos(endAltered) * radius
        } ${Math.sin(endAltered) * radius}`;
    } else {
        arc = `M ${Math.cos(startAltered - Math.PI) * radius} ${
            Math.sin(startAltered - Math.PI) * radius
        } A ${radius} ${radius} 0 ${largeArcFlag} 0 ${
            Math.cos(endAltered - Math.PI) * radius
        } ${Math.sin(endAltered - Math.PI) * radius}`;
    }
    return (
        <g>
            <path
                d={`M 0 0 L ${Math.cos(startAngle) * guideCircleRadius} ${
                    Math.sin(startAngle) * guideCircleRadius
                } A ${guideCircleRadius} ${guideCircleRadius} 0 ${
                    endAngle - startAngle > Math.PI ? 1 : 0
                } 1 ${Math.cos(endAngle) * guideCircleRadius} ${
                    Math.sin(endAngle) * guideCircleRadius
                } Z`}
                fill={colorScale(hoverLabel)}
                opacity={0.1}
                onMouseEnter={() => {
                    setHoveredLabel(hoverLabel);
                }}
                onMouseLeave={() => {
                    setHoveredLabel('');
                }}
            />
            <g
                onMouseEnter={() => {
                    setHoveredLabel(hoverLabel);
                }}
                onMouseLeave={() => {
                    setHoveredLabel('');
                }}
            >
                <path d={arc} fill="none" id={`${hoverLabel}Arc`} />
                <text fill={colorScale(hoverLabel)}>
                    <textPath
                        fontSize={svgFontSize}
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        xlinkHref={`#${hoverLabel}Arc`}
                        fill={colorScale(hoverLabel)}
                        startOffset={'50%'}
                    >
                        {labels[hoverLabel] ? labels[hoverLabel].value : ''}
                    </textPath>
                </text>
            </g>
        </g>
    );
});

export default RadarLabel;
