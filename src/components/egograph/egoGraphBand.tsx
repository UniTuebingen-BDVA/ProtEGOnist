import {
    midPointPolar,
    distancePolar,
    polarIsBetween
} from '../../UtilityFunctions';
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

function subtractAngle(theta: number, epsilon: number) {
    if (theta - epsilon < -Math.PI) {
        const remainder = theta - epsilon + Math.PI;
        return Math.PI + remainder;
    } else return theta - epsilon;
}

function addAngle(theta: number, epsilon: number) {
    if (theta + epsilon > Math.PI) {
        const remainder = theta + epsilon - Math.PI;
        return -Math.PI + remainder;
    } else return theta + epsilon;
}

function positionTips(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number],
    radius: number,
    centerPosC1: { x: number; y: number },
    centerPosC2: { x: number; y: number }
) {
    const TIP_MAX_ANGLE = 0.4; //rad
    let p1Cartesian = structuredClone(p1);
    let p2Cartesian = structuredClone(p2);
    const p3Cartesian = structuredClone(p3);
    const p4Cartesian = structuredClone(p4);

    let p1LocalPolarC1 = cartesianToPolar(
        globalToLocal(p1Cartesian, centerPosC1)
    );
    let p2LocalPolarC1 = cartesianToPolar(
        globalToLocal(p2Cartesian, centerPosC1)
    );
    //console.log('start', p1LocalPolar.theta, p2LocalPolar.theta, centerPos);
    // const p3LocalPolarC1 = cartesianToPolar(
    //     globalToLocal(p4Cartesian, centerPosC1)
    // );
    // const p4LocalPolarC1 = cartesianToPolar(
    //     globalToLocal(p3Cartesian, centerPosC1)
    // );

    const p3LocalPolarC2 = cartesianToPolar(
        globalToLocal(p3Cartesian, centerPosC2)
    );
    const p4LocalPolarC2 = cartesianToPolar(
        globalToLocal(p4Cartesian, centerPosC2)
    );

    const centerPosC2PolarC1 = cartesianToPolar(
        globalToLocal([centerPosC2.x, centerPosC2.y], centerPosC1)
    );
    // check if radius of p1 and p2 is the same within an epsilon and throw error if not
    if (Math.abs(p1LocalPolarC1.r - p2LocalPolarC1.r) > 0.0001) {
        throw new Error(
            'The radius of p1 and p2 is not the same. Check your input'
        );
    } else {
        p1LocalPolarC1.r = radius;
        p2LocalPolarC1.r = radius;
    }

    // const halfcircleCondition =
    //     Math.abs(p1LocalPolarC1.theta) === Math.abs(p2LocalPolarC1.theta);
    // const flipCondition = halfcircleCondition && p2LocalPolarC1.theta < 0;
    // if (flipCondition) {
    //     p1LocalPolarC1.theta = p1LocalPolarC1.theta + Math.PI;
    //     p2LocalPolarC1.theta = p2LocalPolarC1.theta + Math.PI;
    // }

    p1Cartesian = localToGlobal(
        polarToCartesian(p1LocalPolarC1.r, p1LocalPolarC1.theta),
        centerPosC1
    );
    p2Cartesian = localToGlobal(
        polarToCartesian(p2LocalPolarC1.r, p2LocalPolarC1.theta),
        centerPosC1
    );

    // calculate the midpoint between p1LocalPolar and p2LocalPolar consider that the midpoint of 3/2 pi and 1/2 pi is 0
    const midpointP1P2PolarC1 = {
        r: radius,
        theta: midPointPolar(p1LocalPolarC1.theta, p2LocalPolarC1.theta)
    };
    // const midpointP3P4PolarC1 = {
    //     r: p3LocalPolarC1.r,
    //     theta: midPointPolar(p3LocalPolarC1.theta, p4LocalPolarC1.theta)
    // };

    const midpointP3P4PolarC2 = {
        r: p3LocalPolarC2.r,
        theta: midPointPolar(p3LocalPolarC2.theta, p4LocalPolarC2.theta)
    };

    const midpointP3P4cartesianC2 = localToGlobal(
        polarToCartesian(midpointP3P4PolarC2.r, midpointP3P4PolarC2.theta),
        centerPosC2
    );

    const midpointP3P4PolarC1 = cartesianToPolar(
        globalToLocal(midpointP3P4cartesianC2, centerPosC1)
    );

    const adjustedTipPosition1 = {
        r: radius,
        theta: midpointP3P4PolarC1.theta
    };

    let tipPosition1 = adjustedTipPosition1;

    // calculate the beginning of the "tip" of the arc (the point where the arc starts to bend) such that the angle between the tip and the midpoint is TIP_MAX_ANGLE or the radius of the arc, whichever is smaller

    const tipBaseP2Polar = {
        r: radius,
        theta: addAngle(tipPosition1.theta, TIP_MAX_ANGLE / 2)
    };
    const tipBaseP1Polar = {
        r: radius,
        theta: subtractAngle(tipPosition1.theta, TIP_MAX_ANGLE / 2)
    };
    const correctionAngle = 0; //TIP_MAX_ANGLE / 10;
    //check if the tip is within the arc TODO HERE BE DRAGONS
    if (
        !polarIsBetween(
            p1LocalPolarC1.theta,
            p2LocalPolarC1.theta,
            tipBaseP2Polar.theta
        ) &&
        !polarIsBetween(
            p1LocalPolarC1.theta,
            p2LocalPolarC1.theta,
            tipBaseP1Polar.theta
        )
    ) {
        const p1DistTip = distancePolar(
            p1LocalPolarC1.theta,
            tipPosition1.theta
        );
        const p2DistTip = distancePolar(
            tipPosition1.theta,
            p2LocalPolarC1.theta
        );
        if (p1DistTip > p2DistTip) {
            tipPosition1 = p1LocalPolarC1;
            tipBaseP1Polar.theta = subtractAngle(
                p1LocalPolarC1.theta,
                TIP_MAX_ANGLE / 2
            );
        } else {
            tipPosition1 = p2LocalPolarC1;
            tipBaseP2Polar.theta = addAngle(
                p2LocalPolarC1.theta,
                TIP_MAX_ANGLE / 2
            );
        }
    }

    if (
        !polarIsBetween(
            p1LocalPolarC1.theta,
            p2LocalPolarC1.theta,
            tipBaseP2Polar.theta
        )
    ) {
        tipBaseP2Polar.theta = addAngle(p1LocalPolarC1.theta, correctionAngle);
        if (
            !polarIsBetween(
                p1LocalPolarC1.theta,
                p2LocalPolarC1.theta,
                tipPosition1.theta
            )
        ) {
            tipPosition1.theta = addAngle(
                p1LocalPolarC1.theta,
                correctionAngle
            );
        }
    }
    if (
        !polarIsBetween(
            p1LocalPolarC1.theta,
            p2LocalPolarC1.theta,
            tipBaseP1Polar.theta
        )
    ) {
        tipBaseP1Polar.theta = subtractAngle(
            p2LocalPolarC1.theta,
            correctionAngle
        );

        if (
            !polarIsBetween(
                p1LocalPolarC1.theta,
                p2LocalPolarC1.theta,
                tipPosition1.theta
            )
        ) {
            tipPosition1.theta = subtractAngle(
                p2LocalPolarC1.theta,
                correctionAngle
            );
        }
    }

    console.log('coords', p1LocalPolarC1.theta, p2LocalPolarC1.theta);
    const p1tipbaseAngle = Math.abs(
        distancePolar(p1LocalPolarC1.theta, tipBaseP2Polar.theta)
    );
    const p2tipbaseAngle = Math.abs(
        distancePolar(tipBaseP1Polar.theta, p2LocalPolarC1.theta)
    );
    console.log('p1p2', p1tipbaseAngle, p2tipbaseAngle);

    const tipBaseP1Cartesian = localToGlobal(
        polarToCartesian(tipBaseP2Polar.r, tipBaseP2Polar.theta),
        centerPosC1
    );
    const tipBaseP2Cartesian = localToGlobal(
        polarToCartesian(tipBaseP1Polar.r, tipBaseP1Polar.theta),
        centerPosC1
    );
    const tipPositionCartesian = localToGlobal(
        polarToCartesian(tipPosition1.r, tipPosition1.theta),
        centerPosC1
    );
    return [
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        tipPositionCartesian,
        p1tipbaseAngle,
        p2tipbaseAngle
    ];
}

function offsetTips(
    offsetPointMain: [number, number],
    vectorAssist: [number, number],
    tipPointControl: [number, number],
    connectorControl: [number, number],
    offsetDistance: [number, number],
    ownCenter: [number, number]
): [number, number][] {
    // calculate the vector between the two tip points
    const fromCenterToOffsetPointMain = [
        offsetPointMain[0] - ownCenter[0],
        offsetPointMain[1] - ownCenter[1]
    ];
    const tipVector = [
        offsetPointMain[0] - vectorAssist[0],
        offsetPointMain[1] - vectorAssist[1]
    ];
    //check if the abs of the dot product of the two vectors is < 1/3 Pi
    const dotProduct =
        fromCenterToOffsetPointMain[0] * tipVector[0] +
        fromCenterToOffsetPointMain[1] * tipVector[1];
    const angle = Math.acos(
        dotProduct /
            Math.sqrt(
                fromCenterToOffsetPointMain[0] *
                    fromCenterToOffsetPointMain[0] +
                    fromCenterToOffsetPointMain[1] *
                        fromCenterToOffsetPointMain[1]
            ) /
            Math.sqrt(tipVector[0] * tipVector[0] + tipVector[1] * tipVector[1])
    );
    let tipVectorNormalized = [0, 0];
    if (angle < (Math.PI * 2) / 2) {
        // set the vector such that angles with 1/3 Pi
        const rot = (Math.sign(dotProduct) * -2 * Math.PI) / 2;
        const fromCenterToOffsetPointMainLength = Math.sqrt(
            fromCenterToOffsetPointMain[0] * fromCenterToOffsetPointMain[0] +
                fromCenterToOffsetPointMain[1] * fromCenterToOffsetPointMain[1]
        );
        const fromCenterToOffsetPointMainNormalized = [
            fromCenterToOffsetPointMain[0] / fromCenterToOffsetPointMainLength,
            fromCenterToOffsetPointMain[1] / fromCenterToOffsetPointMainLength
        ];

        tipVectorNormalized = [
            fromCenterToOffsetPointMainNormalized[0] * Math.cos(rot) -
                fromCenterToOffsetPointMainNormalized[1] * Math.sin(rot),
            fromCenterToOffsetPointMainNormalized[0] * Math.sin(rot) +
                fromCenterToOffsetPointMainNormalized[1] * Math.cos(rot)
        ];
    } else {
        // calculate the length of the tip vector
        const tipVectorLength = Math.sqrt(
            tipVector[0] * tipVector[0] + tipVector[1] * tipVector[1]
        );

        // normalize the tip vector
        tipVectorNormalized = [
            tipVector[0] / tipVectorLength,
            tipVector[1] / tipVectorLength
        ];
    }

    // calculate the offset vector
    const offsetVector = [
        tipVectorNormalized[1] * -offsetDistance,
        tipVectorNormalized[0] * offsetDistance
    ];

    // calculate the offset points
    const tipPoint1OffsetCartesian: [number, number] = [
        offsetPointMain[0] + offsetVector[0],
        offsetPointMain[1] + offsetVector[1]
    ];

    const tipPoint2OffsetCartesian: [number, number] = [
        offsetPointMain[0] - offsetVector[0],
        offsetPointMain[1] - offsetVector[1]
    ];
    const tipPoint1ControlOffsetCartesian: [number, number] = [
        tipPointControl[0] + offsetVector[0],
        tipPointControl[1] + offsetVector[1]
    ];

    const tipPoint2ControlOffsetCartesian: [number, number] = [
        tipPointControl[0] - offsetVector[0],
        tipPointControl[1] - offsetVector[1]
    ];
    const connectorControl1OffsetCartesian: [number, number] = [
        connectorControl[0] + offsetVector[0],
        connectorControl[1] + offsetVector[1]
    ];

    const connectorControl2OffsetCartesian: [number, number] = [
        connectorControl[0] - offsetVector[0],
        connectorControl[1] - offsetVector[1]
    ];

    return [
        tipPoint1OffsetCartesian,
        tipPoint2OffsetCartesian,
        tipPoint1ControlOffsetCartesian,
        tipPoint2ControlOffsetCartesian,
        connectorControl1OffsetCartesian,
        connectorControl2OffsetCartesian
    ];
}

function orientTips(
    tipPosition1Cartesian: [number, number],
    tipPosition2Cartesian: [number, number],
    centerPos: { x: number; y: number }
) {
    const TIP_LENGTH = 0.2;

    const tipPosition1Polar = cartesianToPolar(
        globalToLocal(tipPosition1Cartesian, centerPos)
    );

    const tipPosition2Polar = cartesianToPolar(
        globalToLocal(tipPosition2Cartesian, centerPos)
    );

    const angleDifference = distancePolar(
        tipPosition1Polar.theta,
        tipPosition2Polar.theta
    );

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
        r: tipPoint1Polar.r * (1 + TIP_LENGTH * 1.05),
        theta: tipPoint1Polar.theta
    };
    const tipPointControlPolar = {
        r: tipPosition1Polar.r * 1.04,
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
    p1BaseAngle: number,
    p2BaseAngle: number,
    tipPoint1Cartesian: [number, number],
    tipPoint2Cartesian: [number, number],
    tipPointControlCartesian1: [number, number],
    tipPointControlCartesian2: [number, number],
    centerPos: { x: number; y: number },
    radius: number
) {
    console.log('p1p2dras', p1BaseAngle, p2BaseAngle);

    //generate an svg arc from p1Cartesian to tipBaseP1Cartesian
    //const arc_P1_tipBase = `M${p2[0]} ${p2[1]}  A ${radius} ${radius} 0 0 1 ${p1[0]} ${p1[1]}`;
    const arc_P1_tipBase = `M ${p1Cartesian[0]} ${
        p1Cartesian[1]
    } A ${radius} ${radius} 0 ${p1BaseAngle >= Math.PI ? 1 : 0} 0 ${
        tipBaseP2Cartesian[0]
    } ${tipBaseP2Cartesian[1]}`;
    // generate quadratic curve from tipBaseP1Cartesian to tipPoint1Cartesian with midpoinP1P2Cartesian as control point
    const quadraticCurve_tipBaseP1_tipPoint1 = `Q ${tipPointControlCartesian1[0]} ${tipPointControlCartesian1[1]} ${tipPoint1Cartesian[0]} ${tipPoint1Cartesian[1]}`;

    const connector = `L${tipPoint2Cartesian[0]} ${tipPoint2Cartesian[1]}`;

    // generate svg quadratic curve from tipPoint1Cartesian to tipBaseP2Cartesian
    const quadraticCurve_tipPoint1_tipBaseP2 = `Q ${tipPointControlCartesian2[0]} ${tipPointControlCartesian2[1]} ${tipBaseP1Cartesian[0]} ${tipBaseP1Cartesian[1]}`;
    //generate an svg arc from tipBaseP2Cartesian to p2Cartesian
    const arc_tipBaseP2_P2 = `A ${radius} ${radius} 0 ${
        p2BaseAngle >= Math.PI ? 1 : 0
    } 0 ${p2Cartesian[0]} ${p2Cartesian[1]}`;
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
    const RADIUS_SCALE = 1.07;

    const firstPos: [number, number] = [start[1].pos.x, start[1].pos.y];
    const secondPos: [number, number] = [start[0].pos.x, start[0].pos.y];
    const OFFSET_SCALE_1 = Math.min(
        0.05 * radius,
        Math.sqrt(
            (firstPos[0] - secondPos[0]) ** 2 +
                (firstPos[1] - secondPos[1]) ** 2
        ) / 2
    );

    const thirdPos: [number, number] = [end[1].pos.x, end[1].pos.y];
    const fourthPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const OFFSET_SCALE_2 = Math.min(
        0.05 * radius,
        Math.sqrt(
            (thirdPos[0] - fourthPos[0]) ** 2 +
                (thirdPos[1] - fourthPos[1]) ** 2
        ) / 2
    );

    const [
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        tipPosition1Cartesian,
        p1BaseAngle,
        p2BaseAngle
    ] = positionTips(
        firstPos,
        secondPos,
        thirdPos,
        fourthPos,
        radius * RADIUS_SCALE,
        start[0].graphCenterPos,
        end[0].graphCenterPos
    );

    const [
        p3Cartesian,
        p4Cartesian,
        tipBaseP3Cartesian,
        tipBaseP4Cartesian,
        tipPosition2Cartesian,
        p3BaseAngle,
        p4BaseAngle
    ] = positionTips(
        thirdPos,
        fourthPos,
        firstPos,
        secondPos,
        radius * RADIUS_SCALE,
        end[0].graphCenterPos,
        start[0].graphCenterPos
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
        tipPoint1ControlOffsetCartesianPos,
        connectorControl1OffsetCartesianNeg,
        connectorControl1OffsetCartesianPos
    ] = offsetTips(
        tipPoint1Cartesian,
        tipPoint3Cartesian,
        tipPointControlCartesian,
        tipPoint2Cartesian,
        OFFSET_SCALE_1,
        [start[0].graphCenterPos.x, start[0].graphCenterPos.y]
    );
    const [
        tipPoint2OffsetCartesianNeg,
        tipPoint2OffsetCartesianPos,
        tipPoint2ControlOffsetCartesianNeg,
        tipPoint2ControlOffsetCartesianPos,
        connectorControl2OffsetCartesianNeg,
        connectorControl2OffsetCartesianPos
    ] = offsetTips(
        tipPoint3Cartesian,
        tipPoint1Cartesian,
        tipPointControlCartesian2,
        tipPoint4Cartesian,
        OFFSET_SCALE_2,
        [end[0].graphCenterPos.x, end[0].graphCenterPos.y]
    );
    const arc1 = drawTip(
        p1Cartesian,
        p2Cartesian,
        tipBaseP1Cartesian,
        tipBaseP2Cartesian,
        p1BaseAngle,
        p2BaseAngle,
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
        p3BaseAngle,
        p4BaseAngle,
        tipPoint2OffsetCartesianNeg,
        tipPoint2OffsetCartesianPos,
        tipPoint2ControlOffsetCartesianNeg,
        tipPoint2ControlOffsetCartesianPos,
        end[0].graphCenterPos,
        radius * RADIUS_SCALE
    );

    const connector = `
    M ${tipPoint1OffsetCartesianNeg[0]} ${tipPoint1OffsetCartesianNeg[1]}
    C ${connectorControl1OffsetCartesianNeg[0]} ${connectorControl1OffsetCartesianNeg[1]} ${connectorControl2OffsetCartesianPos[0]} ${connectorControl2OffsetCartesianPos[1]} ${tipPoint2OffsetCartesianPos[0]} ${tipPoint2OffsetCartesianPos[1]}
    L ${tipPoint2OffsetCartesianNeg[0]} ${tipPoint2OffsetCartesianNeg[1]}
    C ${connectorControl2OffsetCartesianNeg[0]} ${connectorControl2OffsetCartesianNeg[1]} ${connectorControl1OffsetCartesianPos[0]} ${connectorControl1OffsetCartesianPos[1]} ${tipPoint1OffsetCartesianPos[0]} ${tipPoint1OffsetCartesianPos[1]}
    Z`;
    return [connector, arc1 + arc2];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData, radius, color } = props;
    let pathData: { path: string[]; color: string }[] = [];
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
