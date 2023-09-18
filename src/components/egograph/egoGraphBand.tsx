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
    const factor = 0.3;
    const arcFactor = 1.05;
    const arcFactor2 = 1.2;

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
    const firstSecondMidpointControl: [number, number] = [
        firstSecondMidpoint[0] +
            (firstSecondMidpoint[0] - start[0].graphCenterPos.x) * factor,
        firstSecondMidpoint[1] +
            (firstSecondMidpoint[1] - start[0].graphCenterPos.y) * factor
    ];

    const firstSecondMidpointControl2: [number, number] = [
        firstSecondMidpoint[0] +
            (firstSecondMidpoint[0] - start[0].graphCenterPos.x) * factor * 2,
        firstSecondMidpoint[1] +
            (firstSecondMidpoint[1] - start[0].graphCenterPos.y) * factor * 2
    ];
    firstSecondMidpoint[0] -= start[0].graphCenterPos.x;
    firstSecondMidpoint[1] -= start[0].graphCenterPos.y;
    firstSecondMidpoint[0] *= arcFactor2;
    firstSecondMidpoint[1] *= arcFactor2;
    firstSecondMidpoint[0] += start[0].graphCenterPos.x;
    firstSecondMidpoint[1] += start[0].graphCenterPos.y;

    const firstArcPos: [number, number] = scaleVectorToLength(
        firstPos[0] - start[0].graphCenterPos.x,
        firstPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor
    );
    firstArcPos[0] += start[0].graphCenterPos.x;
    firstArcPos[1] += start[0].graphCenterPos.y;

    const firstArcPosControl: [number, number] = scaleVectorToLength(
        firstPos[0] - start[0].graphCenterPos.x,
        firstPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor * arcFactor2
    );
    firstArcPosControl[0] += start[0].graphCenterPos.x;
    firstArcPosControl[1] += start[0].graphCenterPos.y;

    const secondArcPos: [number, number] = scaleVectorToLength(
        secondPos[0] - start[0].graphCenterPos.x,
        secondPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor
    );
    secondArcPos[0] += start[0].graphCenterPos.x;
    secondArcPos[1] += start[0].graphCenterPos.y;

    const secondArcPosControl: [number, number] = scaleVectorToLength(
        secondPos[0] - start[0].graphCenterPos.x,
        secondPos[1] - start[0].graphCenterPos.y,
        radius * arcFactor * arcFactor2
    );
    secondArcPosControl[0] += start[0].graphCenterPos.x;
    secondArcPosControl[1] += start[0].graphCenterPos.y;

    const thirdFourthMidpoint: [number, number] = scaleVectorToLength(
        (thirdPos[0] + fourthPos[0]) / 2 - end[0].graphCenterPos.x,
        (thirdPos[1] + fourthPos[1]) / 2 - end[0].graphCenterPos.y,
        radius
    );
    thirdFourthMidpoint[0] += end[0].graphCenterPos.x;
    thirdFourthMidpoint[1] += end[0].graphCenterPos.y;

    const thirdFourthMidpointControl: [number, number] = [
        thirdFourthMidpoint[0] +
            (thirdFourthMidpoint[0] - end[0].graphCenterPos.x) * factor,
        thirdFourthMidpoint[1] +
            (thirdFourthMidpoint[1] - end[0].graphCenterPos.y) * factor
    ];

    const thirdFourthMidpointControl2: [number, number] = [
        thirdFourthMidpoint[0] +
            (thirdFourthMidpoint[0] - end[0].graphCenterPos.x) * factor * 2,
        thirdFourthMidpoint[1] +
            (thirdFourthMidpoint[1] - end[0].graphCenterPos.y) * factor * 2
    ];

    thirdFourthMidpoint[0] -= end[0].graphCenterPos.x;
    thirdFourthMidpoint[1] -= end[0].graphCenterPos.y;
    thirdFourthMidpoint[0] *= arcFactor2;
    thirdFourthMidpoint[1] *= arcFactor2;
    thirdFourthMidpoint[0] += end[0].graphCenterPos.x;
    thirdFourthMidpoint[1] += end[0].graphCenterPos.y;

    const thirdArcPos: [number, number] = scaleVectorToLength(
        thirdPos[0] - end[0].graphCenterPos.x,
        thirdPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor
    );
    thirdArcPos[0] += end[0].graphCenterPos.x;
    thirdArcPos[1] += end[0].graphCenterPos.y;

    const thirdArcPosControl: [number, number] = scaleVectorToLength(
        thirdPos[0] - end[0].graphCenterPos.x,
        thirdPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor * arcFactor2
    );
    thirdArcPosControl[0] += end[0].graphCenterPos.x;
    thirdArcPosControl[1] += end[0].graphCenterPos.y;

    const fourthArcPos: [number, number] = scaleVectorToLength(
        fourthPos[0] - end[0].graphCenterPos.x,
        fourthPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor
    );
    fourthArcPos[0] += end[0].graphCenterPos.x;
    fourthArcPos[1] += end[0].graphCenterPos.y;

    const fourthArcPosControl: [number, number] = scaleVectorToLength(
        fourthPos[0] - end[0].graphCenterPos.x,
        fourthPos[1] - end[0].graphCenterPos.y,
        radius * arcFactor * arcFactor2
    );
    fourthArcPosControl[0] += end[0].graphCenterPos.x;
    fourthArcPosControl[1] += end[0].graphCenterPos.y;

    // build the d attributes by calculating the cubic bezier curve
    const basisSpline = d3.line().curve(d3.curveBasis);
    const curve = basisSpline([
        firstSecondMidpointControl,
        firstSecondMidpointControl2,
        thirdFourthMidpointControl2,
        thirdFourthMidpointControl
    ]);

    return [
        `
        ${curve}
        `,
        `M${firstArcPos[0]} ${firstArcPos[1]}
        C ${firstArcPosControl[0]} ${firstArcPosControl[1]} ${firstSecondMidpoint[0]} ${firstSecondMidpoint[1]} ${firstSecondMidpointControl[0]} ${firstSecondMidpointControl[1]}
        C ${firstSecondMidpoint[0]} ${firstSecondMidpoint[1]} ${secondArcPosControl[0]} ${secondArcPosControl[1]} ${secondArcPos[0]} ${secondArcPos[1]}
        L ${start[0].graphCenterPos.x} ${start[0].graphCenterPos.y}
        Z
        M${thirdArcPos[0]} ${thirdArcPos[1]}
        C ${thirdArcPosControl[0]} ${thirdArcPosControl[1]} ${thirdFourthMidpoint[0]} ${thirdFourthMidpoint[1]} ${thirdFourthMidpointControl[0]} ${thirdFourthMidpointControl[1]}
        C ${thirdFourthMidpoint[0]} ${thirdFourthMidpoint[1]} ${fourthArcPosControl[0]} ${fourthArcPosControl[1]} ${fourthArcPos[0]} ${fourthArcPos[1]}
        L ${end[0].graphCenterPos.x} ${end[0].graphCenterPos.y}
        Z
    `
    ];
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
                strokeWidth="5"
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
