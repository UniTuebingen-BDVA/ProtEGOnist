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
    color: string;
}

function globalToLocal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] - center.x, point[1] - center.y];
}

function localToGlobal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] + center.x, point[1] + center.y];
}

function cartesianToPolar(point: [number, number]) {
    const r = Math.sqrt(point[0] * point[0] + point[1] * point[1]);
    const theta = Math.atan2(point[1], point[0]);
    return { r, theta };
}
function polarToCartesian(
    radius: number,
    angleInRadians: number
): [number, number] {
    return [
        radius * Math.cos(angleInRadians),
        radius * Math.sin(angleInRadians)
    ];
}

function positionTips(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number],
    radius: number,
    centerPos: { x: number; y: number }
) {
    const TIP_MAX_ANGLE = 0.7; //rad
    let p1Cartesian = structuredClone(p1);
    let p2Cartesian = structuredClone(p2);
    const p3Cartesian = structuredClone(p3);
    const p4Cartesian = structuredClone(p4);

    let p1LocalPolar = cartesianToPolar(globalToLocal(p1Cartesian, centerPos));
    let p2LocalPolar = cartesianToPolar(globalToLocal(p2Cartesian, centerPos));
    const p3LocalPolar = cartesianToPolar(
        globalToLocal(p3Cartesian, centerPos)
    );
    const p4LocalPolar = cartesianToPolar(
        globalToLocal(p4Cartesian, centerPos)
    );

    // check if radius of p1 and p2 is the same within an epsilon and throw error if not
    if (Math.abs(p1LocalPolar.r - p2LocalPolar.r) > 0.0001) {
        throw new Error(
            'The radius of p1 and p2 is not the same. Check your input'
        );
    } else {
        p1LocalPolar.r = radius;
        p2LocalPolar.r = radius;
    }

    //check the order of p1 and p2
    if (p1LocalPolar.theta > p2LocalPolar.theta) {
        const temp = p1LocalPolar;
        p1LocalPolar = p2LocalPolar;
        p2LocalPolar = temp;
    }
    //check the order of p1 and p2
    if (p2LocalPolar.theta - p1LocalPolar.theta > Math.PI) {
        const temp = p1LocalPolar;
        p1LocalPolar = p2LocalPolar;
        p2LocalPolar = temp;
        p2LocalPolar.theta = 2 * Math.PI + temp.theta;
    }

    //adjust p1 and p2 such that the stroke doesnt overlap with neighboring bands
    p1LocalPolar.theta -= 0.02;
    p2LocalPolar.theta += 0.02;

    p1Cartesian = localToGlobal(
        polarToCartesian(p1LocalPolar.r, p1LocalPolar.theta),
        centerPos
    );
    p2Cartesian = localToGlobal(
        polarToCartesian(p2LocalPolar.r, p2LocalPolar.theta),
        centerPos
    );

    // calculate the midpoint between p1LocalPolar and p2LocalPolar
    const midpointP1P2Polar = {
        r: radius,
        theta:
            p1LocalPolar.theta + (p2LocalPolar.theta - p1LocalPolar.theta) / 2
    };
    const midpointP3P4Polar = {
        r: p3LocalPolar.r,
        theta:
            p3LocalPolar.theta + (p4LocalPolar.theta - p3LocalPolar.theta) / 2
    };

    const adjustedTipPosition1 = {
        r: radius,
        theta:
            midpointP1P2Polar.theta +
            (midpointP3P4Polar.theta - midpointP1P2Polar.theta)
    };

    const tipPosition1 =
        p1LocalPolar.theta < adjustedTipPosition1.theta &&
        adjustedTipPosition1.theta < p2LocalPolar.theta
            ? adjustedTipPosition1
            : midpointP1P2Polar;

    // calculate the beginning of the "tip" of the arc (the point where the arc starts to bend) such that the angle between the tip and the midpoint is TIP_MAX_ANGLE or the radius of the arc, whichever is smaller
    const tipBaseP1Polar = {
        r: radius,
        theta: tipPosition1.theta - TIP_MAX_ANGLE / 2
    };
    const tipBaseP2Polar = {
        r: radius,
        theta: tipPosition1.theta + TIP_MAX_ANGLE / 2
    };
    //check if the tip is within the arc
    if (tipBaseP1Polar.theta < p1LocalPolar.theta) {
        tipBaseP1Polar.theta = p1LocalPolar.theta;
    }
    if (tipBaseP2Polar.theta > p2LocalPolar.theta) {
        tipBaseP2Polar.theta = p2LocalPolar.theta;
    }
    const tipBaseP1Cartesian = localToGlobal(
        polarToCartesian(tipBaseP1Polar.r, tipBaseP1Polar.theta),
        centerPos
    );
    const tipBaseP2Cartesian = localToGlobal(
        polarToCartesian(tipBaseP2Polar.r, tipBaseP2Polar.theta),
        centerPos
    );
    const tipPositionCartesian = localToGlobal(
        polarToCartesian(tipPosition1.r, tipPosition1.theta),
        centerPos
    );

    return [
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        tipPositionCartesian
    ];
}

function offsetTips(
    offsetPointMain: [number, number],
    vectorAssist: [number, number],
    tipPointControl: [number, number],
    offsetDistance: number
): [number, number][] {
    const offsetAngle = Math.PI / 2; // 90 degrees

    // calculate the vector between the two tip points
    const tipVector = [
        offsetPointMain[0] - vectorAssist[0],
        offsetPointMain[1] - vectorAssist[1]
    ];

    // calculate the length of the tip vector
    const tipVectorLength = Math.sqrt(
        tipVector[0] * tipVector[0] + tipVector[1] * tipVector[1]
    );

    // normalize the tip vector
    const tipVectorNormalized = [
        tipVector[0] / tipVectorLength,
        tipVector[1] / tipVectorLength
    ];

    // calculate the offset vector
    const offsetVector = [
        tipVectorNormalized[1] * offsetDistance,
        -tipVectorNormalized[0] * offsetDistance
    ];

    // calculate the offset points
    const tipPoint1OffsetCartesian: [number, number] = [
        offsetPointMain[0] -
            offsetVector[0] * Math.cos(offsetAngle) -
            offsetVector[1] * Math.sin(offsetAngle),
        offsetPointMain[1] -
            offsetVector[0] * Math.sin(offsetAngle) +
            offsetVector[1] * Math.cos(offsetAngle)
    ];

    const tipPoint2OffsetCartesian: [number, number] = [
        offsetPointMain[0] +
            offsetVector[0] * Math.cos(offsetAngle) -
            offsetVector[1] * Math.sin(offsetAngle),
        offsetPointMain[1] +
            offsetVector[0] * Math.sin(offsetAngle) +
            offsetVector[1] * Math.cos(offsetAngle)
    ];
    const tipPoint1ControlOffsetCartesian: [number, number] = [
        tipPointControl[0] -
            offsetVector[0] * Math.cos(offsetAngle) -
            offsetVector[1] * Math.sin(offsetAngle),
        tipPointControl[1] -
            offsetVector[0] * Math.sin(offsetAngle) +
            offsetVector[1] * Math.cos(offsetAngle)
    ];

    const tipPoint2ControlOffsetCartesian: [number, number] = [
        tipPointControl[0] +
            offsetVector[0] * Math.cos(offsetAngle) -
            offsetVector[1] * Math.sin(offsetAngle),
        tipPointControl[1] +
            offsetVector[0] * Math.sin(offsetAngle) +
            offsetVector[1] * Math.cos(offsetAngle)
    ];

    return [
        tipPoint1OffsetCartesian,
        tipPoint2OffsetCartesian,
        tipPoint1ControlOffsetCartesian,
        tipPoint2ControlOffsetCartesian
    ];
}

function orientTips(
    tipPosition1Cartesian: [number, number],
    tipPosition2Cartesia: [number, number],
    centerPos: { x: number; y: number }
) {
    const TIP_LENGTH = 0.2;

    const tipPosition1Polar = cartesianToPolar(
        globalToLocal(tipPosition1Cartesian, centerPos)
    );

    const tipPosition2Polar = cartesianToPolar(
        globalToLocal(tipPosition2Cartesia, centerPos)
    );

    const angleDifference = tipPosition1Polar.theta - tipPosition2Polar.theta;

    // calculate the tip points from the tip polar coordinates

    const tipPoint1Polar = {
        r: tipPosition1Polar.r * (1 + TIP_LENGTH),
        theta:
            tipPosition1Polar.theta +
            (Math.abs(angleDifference) > 0.1
                ? -0.02 * Math.sign(angleDifference)
                : 0)
    };
    const tipPoint2Polar = {
        r: tipPoint1Polar.r * (1 + TIP_LENGTH * 2),
        theta: tipPoint1Polar.theta
    };
    const tipPointControlPolar = {
        r: tipPosition1Polar.r * 1.05,
        theta: tipPoint1Polar.theta
    };

    //transform all points back to cartesian coordinates using polarToCartesian
    const tipPoint1Cartesian = localToGlobal(
        polarToCartesian(tipPoint1Polar.r, tipPoint1Polar.theta),
        centerPos
    );
    const tipPoint2Cartesian = localToGlobal(
        polarToCartesian(tipPoint2Polar.r, tipPoint2Polar.theta),
        centerPos
    );
    const tipPointControlCartesian = localToGlobal(
        polarToCartesian(tipPointControlPolar.r, tipPointControlPolar.theta),
        centerPos
    );
    return [tipPoint1Cartesian, tipPoint2Cartesian, tipPointControlCartesian];
}

function drawTip(
    p1Cartesian: [number, number],
    p2Cartesian: [number, number],
    tipBaseP1Cartesian: [number, number],
    tipBaseP2Cartesian: [number, number],
    tipPoint1Cartesian: [number, number],
    tipPoint2Cartesian: [number, number],
    tipPointControlCartesian1: [number, number],
    tipPointControlCartesian2: [number, number],
    centerPos: { x: number; y: number },
    radius: number
) {
    //generate an svg arc from p1Cartesian to tipBaseP1Cartesian
    //const arc_P1_tipBase = `M${p2[0]} ${p2[1]}  A ${radius} ${radius} 0 0 1 ${p1[0]} ${p1[1]}`;
    const arc_P1_tipBase = `M ${p1Cartesian[0]} ${p1Cartesian[1]} A ${radius} ${radius} 0 0 1 ${tipBaseP1Cartesian[0]} ${tipBaseP1Cartesian[1]}`;
    // generate quadratic curve from tipBaseP1Cartesian to tipPoint1Cartesian with midpoinP1P2Cartesian as control point
    const quadraticCurve_tipBaseP1_tipPoint1 = `Q ${tipPointControlCartesian1[0]} ${tipPointControlCartesian1[1]} ${tipPoint1Cartesian[0]} ${tipPoint1Cartesian[1]}`;

    const connector = `L${tipPoint2Cartesian[0]} ${tipPoint2Cartesian[1]}`;

    // generate svg quadratic curve from tipPoint1Cartesian to tipBaseP2Cartesian
    const quadraticCurve_tipPoint1_tipBaseP2 = `Q ${tipPointControlCartesian2[0]} ${tipPointControlCartesian2[1]} ${tipBaseP2Cartesian[0]} ${tipBaseP2Cartesian[1]}`;
    //generate an svg arc from tipBaseP2Cartesian to p2Cartesian
    const arc_tipBaseP2_P2 = `A ${radius} ${radius} 0 0 1 ${p2Cartesian[0]} ${p2Cartesian[1]}`;
    // draw a line from p2Cartesian to centerPos and close it
    const line_P2_center = `L ${centerPos.x} ${centerPos.y} Z`;
    // merge the paths
    //return `${arc_P1_tipBase} ${line_P2_center}`;
    return `${arc_P1_tipBase} ${quadraticCurve_tipBaseP1_tipPoint1} ${connector} ${quadraticCurve_tipPoint1_tipBaseP2} ${arc_tipBaseP2_P2} ${line_P2_center}`;
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
    radius: number
) {
    const RADIUS_SCALE = 1.075;

    const firstPos: [number, number] = [start[0].pos.x, start[0].pos.y];
    const secondPos: [number, number] = [start[1].pos.x, start[1].pos.y];

    const thirdPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const fourthPos: [number, number] = [end[1].pos.x, end[1].pos.y];

    const [
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        tipPosition1Cartesian
    ] = positionTips(
        firstPos,
        secondPos,
        thirdPos,
        fourthPos,
        radius * RADIUS_SCALE,
        start[0].graphCenterPos
    );

    const [
        p3Cartesian,
        p4Cartesian,
        tipBaseP3Cartesian,
        tipBaseP4Cartesian,
        tipPosition2Cartesian
    ] = positionTips(
        thirdPos,
        fourthPos,
        firstPos,
        secondPos,
        radius * RADIUS_SCALE,
        end[0].graphCenterPos
    );

    const [tipPoint1Cartesian, tipPoint2Cartesian, tipPointControlCartesian] =
        orientTips(
            tipPosition1Cartesian,
            tipPosition2Cartesian,
            start[0].graphCenterPos
        );

    const [tipPoint3Cartesian, tipPoint4Cartesian, tipPointControlCartesian2] =
        orientTips(
            tipPosition2Cartesian,
            tipPosition1Cartesian,
            end[0].graphCenterPos
        );
    const [
        tipPoint1OffsetCartesianNeg,
        tipPoint1OffsetCartesianPos,
        tipPoint1ControlOffsetCartesianNeg,
        tipPoint1ControlOffsetCartesianPos
    ] = offsetTips(
        tipPoint1Cartesian,
        tipPoint3Cartesian,
        tipPointControlCartesian,
        radius * 0.05
    );
    const [
        tipPoint2OffsetCartesianNeg,
        tipPoint2OffsetCartesianPos,
        tipPoint2ControlOffsetCartesianNeg,
        tipPoint2ControlOffsetCartesianPos
    ] = offsetTips(
        tipPoint3Cartesian,
        tipPoint1Cartesian,
        tipPointControlCartesian2,
        radius * 0.05
    );
    const arc1 = drawTip(
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        tipPoint1OffsetCartesianNeg,
        tipPoint1OffsetCartesianPos,
        tipPoint1ControlOffsetCartesianNeg,
        tipPoint1ControlOffsetCartesianPos,
        start[0].graphCenterPos,
        radius * RADIUS_SCALE
    );
    const arc2 = drawTip(
        p3Cartesian,
        p4Cartesian,
        tipBaseP3Cartesian,
        tipBaseP4Cartesian,
        tipPoint2OffsetCartesianNeg,
        tipPoint2OffsetCartesianPos,
        tipPoint2ControlOffsetCartesianNeg,
        tipPoint2ControlOffsetCartesianPos,
        end[0].graphCenterPos,
        radius * RADIUS_SCALE
    );

    const connector = `
    M ${tipPoint1OffsetCartesianNeg[0]} ${tipPoint1OffsetCartesianNeg[1]}
    C ${tipPoint2Cartesian[0]} ${tipPoint2Cartesian[1]} ${tipPoint4Cartesian[0]} ${tipPoint4Cartesian[1]} ${tipPoint2OffsetCartesianPos[0]} ${tipPoint2OffsetCartesianPos[1]}
    L ${tipPoint2OffsetCartesianNeg[0]} ${tipPoint2OffsetCartesianNeg[1]}
    C ${tipPoint4Cartesian[0]} ${tipPoint4Cartesian[1]} ${tipPoint2Cartesian[0]} ${tipPoint2Cartesian[1]} ${tipPoint1OffsetCartesianPos[0]} ${tipPoint1OffsetCartesianPos[1]}
    Z`;
    return [connector, arc1 + arc2];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData, radius, color } = props;
    let pathData: { path: string[]; color: string }[] = [];
    console.log('BD', bandData);
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        pathData = [
            {
                path: getPath(start, end, radius),
                color: color
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
            path: getPath(start, mid, radius),
            color: color
        });
        // push mid to end
        pathData.push({
            path: getPath(mid, end, radius),
            color: color
        });
        // push end to start
        pathData.push({
            path: getPath(end, start, radius),
            color: color
        });
    }

    return pathData.map((pathDatum) => (
        <>
            <path
                d={pathDatum.path[1]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="0"
                strokeLinejoin="arc"
                fill={pathDatum.color}
            />
            <path
                d={pathDatum.path[0]}
                className="band"
                stroke={pathDatum.color}
                opacity={0.7}
                strokeWidth="0"
                strokeLinejoin="arc"
                fill={pathDatum.color}
            />
        </>
    ));
};

export default EgoGraphBand;
