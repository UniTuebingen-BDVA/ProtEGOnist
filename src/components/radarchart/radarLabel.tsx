import { Tooltip } from '@mui/material';
import { PrimitiveAtom, useAtom } from 'jotai';
import { set } from 'optics-ts';
import { useEffect, useState } from 'react';
import { labelsAtoms } from './radarStore';

interface radarLabelProps {
    startAngle: number;
    endAngle: number;
    labelAtom: PrimitiveAtom<{ value: string; short: string; long: string }>;
    label: string;
    hoverLabel: string;
    guideCircleRadius: number;
    radius: number;
    color: string;
}

// given radarLabel props draw an arc and a text label along the arc
// if the arc is on the bottom half of the circle, flip the text label upside down
const RadarLabel = (props: radarLabelProps) => {
    const {
        startAngle,
        endAngle,
        label,
        hoverLabel,
        guideCircleRadius,
        radius,
        color
    } = props;
    const midAngle = (startAngle + endAngle) / 2;
    const flipLabel = midAngle > 0 && midAngle < Math.PI;
    const startAltered = startAngle - Math.PI / 4;
    const endAltered = endAngle + Math.PI / 4;
    const [labelValue, labelValueWithID] = useAtom(labelsAtoms);
    // draw the arc from startAngle to endAngle clockwise
    // center the text label such that it is centered along the arc
    let arc = '';
    if (!flipLabel) {
        arc = `M ${Math.cos(startAltered) * radius} ${
            Math.sin(startAltered) * radius
        } A ${radius} ${radius} 0 0 1 ${Math.cos(endAltered) * radius} ${
            Math.sin(endAltered) * radius
        }`;
    } else {
        arc = `M ${Math.cos(startAltered - Math.PI) * radius} ${
            Math.sin(startAltered - Math.PI) * radius
        } A ${radius} ${radius} 0 1 0 ${
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
                fill={color}
                opacity={0.1}
                onMouseEnter={() => {
                    labelValueWithID(hoverLabel);
                }}
                onMouseLeave={() => {
                    labelValueWithID('');
                }}
            />
            <g
                onMouseEnter={() => {
                    console.log('hovering');
                    labelValueWithID(hoverLabel);
                }}
                onMouseLeave={() => {
                    labelValueWithID('');
                }}
            >
                <path d={arc} fill="none" id={`${label}Arc`} />
                <text fill={color}>
                    <textPath
                        fontSize="14px"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        xlinkHref={`#${label}Arc`}
                        fill={color}
                        startOffset={'50%'}
                    >
                        {labelValue[hoverLabel]
                            ? labelValue[hoverLabel].value
                            : ''}
                    </textPath>
                </text>
            </g>
        </g>
    );
};

export default RadarLabel;
