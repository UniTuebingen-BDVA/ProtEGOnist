// ignore all ts errors in this file
// FIXME remove this once refactor is done
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { v4 as uuidv4 } from 'uuid';
import { isNumber } from '@mui/x-data-grid/internals';

interface ColorLegendProps {
    range: string[];
    domain: string[] | number[];
    type: 'quantitative' | 'qualitative';
    transform: string;
    titleParts: string[];
    render: boolean;
    noDataFill?: string;
    fontSize: number;
}

function ColorLegend(props: ColorLegendProps) {
    const {
        range,
        domain,
        type,
        transform,
        titleParts,
        render,
        noDataFill,
        fontSize
    } = props;
    const itemSize = fontSize;
    let colors, labels, noDataBox, noDataLabel;
    let def = null;

    if (type === 'quantitative') {
        const id:string = uuidv4();
        const height = 100;
        def = (
            <linearGradient id={id} y1="0%" x1="0%" y2="100%" x2="0%">
                <stop
                    offset="0%"
                    style={{ stopColor: range[0], stopOpacity: 1 }}
                />
                <stop
                    offset="100%"
                    style={{ stopColor: range[1], stopOpacity: 1 }}
                />
            </linearGradient>
        );
        colors = (
            <rect
                x={0}
                y={0}
                width={itemSize}
                height={height}
                stroke={'gray'}
                fill={'url(#' + id + ')'}
            />
        );
        if (noDataFill) {
            noDataBox = (
                <rect
                    x={0}
                    y={height + itemSize}
                    width={itemSize}
                    height={itemSize}
                    stroke={'gray'}
                    fill={noDataFill}
                />
            );
            noDataBox = (
                <text
                    x={itemSize + 2}
                    y={height + itemSize * 1.9}
                    fontSize={itemSize}
                >
                    {' '}
                    No data{' '}
                </text>
            );
        }
        labels = domain.map((d, i) => {
            let offset = itemSize * 0.5;
            if (i === 0) {
                offset = itemSize * 0.9;
            } else if (i === domain.length - 1) {
                offset = 0;
            }
            return (
                <text
                    key={`${d}_${i}`}
                    x={itemSize + 2}
                    y={(height / (domain.length - 1)) * i + offset}
                    fontSize={itemSize}
                    fontFamily={'monospace'}
                >
                    {isNumber(d) ? Math.round(d * 100) / 100 : d}
                </text>
            );
        });
    } else {
        colors = range.map((d, i) => (
            <rect
                key={d}
                x={0}
                y={(itemSize + 4) * i}
                height={itemSize}
                width={itemSize}
                fill={d}
                stroke={'gray'}
            />
        ));
        labels = domain.map((d, i) => (
            <text
                key={d}
                x={itemSize + 2}
                y={(itemSize + 4) * i + itemSize * 0.9}
                fontSize={itemSize}
                fontFamily={'monospace'}
            >
                {d}
            </text>
        ));
    }


    if (render) {
        return (
            <g transform={transform}>
                    {titleParts.map((part, i) => (
                        <text key={i} fontSize={itemSize} fontFamily={'monospace'} y={itemSize / 2+i*itemSize}>
                            {part}
                        </text>
                    ))}
                <g transform={`translate(0,${itemSize * titleParts.length})`}>
                    <defs>{def}</defs>
                    {colors}
                    {labels}
                    {noDataBox}
                    {noDataLabel}
                </g>
            </g>
        );
    } else {
        return;
    }
}

export default ColorLegend;
