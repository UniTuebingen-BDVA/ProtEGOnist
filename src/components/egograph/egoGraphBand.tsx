import * as d3 from 'd3';

interface EgoGraphBandProps {
    radius: number;
    bandData: [
        string,
        {
            [key: string]: {
                id: string;
                graphCenterPos: { x: number; y: number };
                pos: { x: number; y: number };
            }[];
        }
    ];
}

function scaleVectorToLength(
    x: number,
    y: number,
    scale: number
): [number, number] {
    const length = Math.sqrt(x * x + y * y);
    return [(x / length) * scale, (y / length) * scale];
}

function getPath(
    start: {
        graphCenterPos: { x: number; y: number };
        pos: { x: number; y: number };
    }[],
    end: {
        graphCenterPos: { x: number; y: number };
        pos: { x: number; y: number };
    }[],
    flip: boolean,
    radius: number
) {
    const centerOfArea: [number, number] = [
        (start[0]['pos']['x'] +
            end[0]['pos']['x'] +
            start[1]['pos']['x'] +
            end[1]['pos']['x']) /
            4,
        (start[0]['pos']['y'] +
            end[0]['pos']['y'] +
            start[1]['pos']['y'] +
            end[1]['pos']['y']) /
            4
    ];
    const firstPos: [number, number] = flip
        ? [start[0].pos.x, start[0].pos.y]
        : [start[1].pos.x, start[1].pos.y];
    const secondPos: [number, number] = flip
        ? [start[1].pos.x, start[1].pos.y]
        : [start[0].pos.x, start[0].pos.y];

    const thirdPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const fourthPos: [number, number] = [end[1].pos.x, end[1].pos.y];

    const firstSecondMidpoint: [number, number] = scaleVectorToLength(
        (firstPos[0] + secondPos[0]) / 2 - start[0].graphCenterPos.x,
        (firstPos[1] + secondPos[1]) / 2 - start[0].graphCenterPos.y,
        radius
    );
    firstSecondMidpoint[0] += start[0].graphCenterPos.x;
    firstSecondMidpoint[1] += start[0].graphCenterPos.y;

    const thirdFourthMidpoint: [number, number] = scaleVectorToLength(
        (thirdPos[0] + fourthPos[0]) / 2 - end[0].graphCenterPos.x,
        (thirdPos[1] + fourthPos[1]) / 2 - end[0].graphCenterPos.y,
        radius
    );
    thirdFourthMidpoint[0] += end[0].graphCenterPos.x;
    thirdFourthMidpoint[1] += end[0].graphCenterPos.y;

    // build control points for the cubic bezier curve for each position by using (first,second,thid,fourth)Pos and the respective centerPos aswell as the radius such that the control point is on the vector from the centerPos to the respective position and the distance to the centerPos is radius * 1.2
    const factor = 0.3;
    const firstSecondMidpointControl: [number, number] = [
        firstSecondMidpoint[0] +
            (firstSecondMidpoint[0] - start[0].graphCenterPos.x) * factor,
        firstSecondMidpoint[1] +
            (firstSecondMidpoint[1] - start[0].graphCenterPos.y) * factor
    ];
    const thirdFourthMidpointControl: [number, number] = [
        thirdFourthMidpoint[0] +
            (thirdFourthMidpoint[0] - end[0].graphCenterPos.x) * factor,
        thirdFourthMidpoint[1] +
            (thirdFourthMidpoint[1] - end[0].graphCenterPos.y) * factor
    ];

    // build the d attributes by calculating the cubic bezier curve
    const basisSpline = d3.line().curve(d3.curveBasis);
    const firstCurve = basisSpline([
        firstSecondMidpoint,
        firstSecondMidpointControl,
        thirdFourthMidpointControl,
        thirdFourthMidpoint
    ]);

    const arcFactor = 1.05;

    const firstArcPos: [number, number] = scaleVectorToLength(
        firstPos[0] - start[0].graphCenterPos.x,
        firstPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor
    );
    firstArcPos[0] += start[0].graphCenterPos.x;
    firstArcPos[1] += start[0].graphCenterPos.y;
    const secondArcPos: [number, number] = scaleVectorToLength(
        secondPos[0] - start[0].graphCenterPos.x,
        secondPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor
    );
    secondArcPos[0] += start[0].graphCenterPos.x;
    secondArcPos[1] += start[0].graphCenterPos.y;
    const thirdArcPos: [number, number] = scaleVectorToLength(
        thirdPos[0] - end[0].graphCenterPos.x,
        thirdPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor
    );
    thirdArcPos[0] += end[0].graphCenterPos.x;
    thirdArcPos[1] += end[0].graphCenterPos.y;
    const fourthArcPos: [number, number] = scaleVectorToLength(
        fourthPos[0] - end[0].graphCenterPos.x,
        fourthPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor
    );
    fourthArcPos[0] += end[0].graphCenterPos.x;
    fourthArcPos[1] += end[0].graphCenterPos.y;

    return [
        `
        ${firstCurve}

        `,
        `M${firstArcPos[0]}, ${firstArcPos[1]}
    A${radius * arcFactor} ${radius * arcFactor} 0 0 1 ${secondArcPos[0]} ${
        secondArcPos[1]
    }

    M${thirdArcPos[0]}, ${thirdArcPos[1]}
    A${radius * arcFactor} ${radius * arcFactor} 0 0 1 ${fourthArcPos[0]} ${
        fourthArcPos[1]
    }
    `
    ];

    //return `M${firstSecondMidpoint[0]},${firstSecondMidpoint[1]} L${firstSecondMidpointControl[0]},${firstSecondMidpointControl[1]} L${thirdFourthMidpointControl[0]},${thirdFourthMidpointControl[1]}L${thirdFourthMidpoint[0]},${thirdFourthMidpoint[1]}`;
    // return [
    //     '',
    //     `M ${firstPos[0]} ${firstPos[1]}
    //      L ${secondPos[0]} ${secondPos[1]}
    //      Q ${centerOfArea[0]} ${centerOfArea[1]} ${thirdPos[0]} ${thirdPos[1]}
    //      L ${fourthPos[0]} ${fourthPos[1]}
    //      Q ${centerOfArea[0]} ${centerOfArea[1]} ${firstPos[0]} ${firstPos[1]}`
    // ];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData, radius } = props;
    let pathData: { path: string[]; color: string }[] = [];
    console.log('BD', bandData);
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        pathData = [
            {
                path: getPath(start, end, false, radius),
                color: 'red'
            }
        ];
    }
    if (Object.keys(bandData[1]).length === 3) {
        const start = Object.values(bandData[1])[0];
        const mid = Object.values(bandData[1])[1];
        const end = Object.values(bandData[1])[2];

        //make a path consisting of 3 bands, one for each pair of nodes
        //start to mid, mid to end, end to start
        // push start to mid
        pathData.push({
            path: getPath(start, mid, true, radius),
            color: 'coral'
        });
        // push mid to end
        pathData.push({
            path: getPath(mid, end, true, radius),
            color: 'coral'
        });
        // push end to start
        pathData.push({
            path: getPath(end, start, true, radius),
            color: 'coral'
        });
    }

    return pathData.map((pathDatum) => (
        <>
            <path
                d={pathDatum.path[1]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="2"
                fill={pathDatum.color}
            />
            <path
                d={pathDatum.path[0]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="5"
                fill={'None'}
            />
        </>
    ));
};

export default EgoGraphBand;
