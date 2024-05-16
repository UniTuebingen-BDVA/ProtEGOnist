// import { PrimitiveAtom, useAtom } from 'jotai';
import { useAtom, useSetAtom } from 'jotai';
import { hoveredLabelAtom, labelsAtoms } from './radarStore';
import { memo } from 'react';
import { svgFontSizeAtom } from '../../../uiStore.tsx';

interface radarLabelProps {
    startAngle: number;
    endAngle: number;
    // labelAtom: PrimitiveAtom<{ value: string; short: string; long: string }>;
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
        hoverLabel,
        guideCircleRadius,
        radius,
        colorScale
    } = props;
    const midAngle = (startAngle + endAngle) / 2;
    const startEnd=midAngle>Math.PI?midAngle-Math.PI:midAngle+Math.PI;
    const flipLabel = midAngle > 0 && midAngle < Math.PI;
    //const startAltered = startAngle - labelOffset;
    //const endAltered = endAngle + labelOffset;
    const startAltered=startEnd+0.000001;
    const endAltered=startEnd-0.000001;
    const largeArcFlag =1;
        //arcLength > Math.PI ? (flipLabel ? 0 : 1) : flipLabel ? 1 : 0;
    const setHoveredLabel = useSetAtom(hoveredLabelAtom);
    const [labels]=useAtom(labelsAtoms);
    const [svgFontSize] = useAtom(svgFontSizeAtom)
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
        arc = `M ${Math.cos(endAltered) * radius} ${
            Math.sin(endAltered) * radius
        } A ${radius} ${radius} 0 ${largeArcFlag} 0 ${
            Math.cos(startAltered) * radius
        } ${Math.sin(startAltered) * radius}`;
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
                        fontFamily={'monospace'}
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
