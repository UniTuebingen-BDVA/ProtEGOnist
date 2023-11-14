import {
    cartesianToPolar,
    distancePolar,
    globalToLocal,
    localToGlobal,
    midPointPolar,
    polarIsBetween,
    polarToCartesian,
    subtractAngle,
    addAngle,
    polarCoordinate
} from './polarUtilities';

import { selectedBandAtom } from './egoGraphBundleStore';
import { useAtom } from 'jotai';
interface EgoGraphBandProps {
    bandData: [
        string,
        {
            [key: string]: {
                id: string;
                graphCenterPos: {
                    x: number;
                    y: number;
                    id: string;
                    outerSize: number;
                };
                pos: { x: number; y: number };
            }[];
        }
    ];
    color: string;
    twoCase: boolean;
}

function positionTips(
    p1: [number, number],
    p2: [number, number],
    p3: [number, number],
    p4: [number, number],
    radiusScale: number,
    centerPosC1: { x: number; y: number; id: string; outerSize: number },
    centerPosC2: { x: number; y: number; id: string; outerSize: number },
    twoCase: number | boolean = false
): [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    number,
    number
] {
    const TIP_MAX_ANGLE = 0.4; //rad
    let p1Cartesian = structuredClone(p1);
    let p2Cartesian = structuredClone(p2);
    const p3Cartesian = structuredClone(p3);
    const p4Cartesian = structuredClone(p4);
    const scaledOuterSizeC1 = centerPosC1.outerSize * radiusScale;

    const p1LocalPolarC1 = cartesianToPolar(
        globalToLocal(p1Cartesian, centerPosC1)
    );
    const p2LocalPolarC1 = cartesianToPolar(
        globalToLocal(p2Cartesian, centerPosC1)
    );

    const p3LocalPolarC2 = cartesianToPolar(
        globalToLocal(p3Cartesian, centerPosC2)
    );
    const p4LocalPolarC2 = cartesianToPolar(
        globalToLocal(p4Cartesian, centerPosC2)
    );

    // check if radius of p1 and p2 is the same within an epsilon and throw error if not
    if (Math.abs(p1LocalPolarC1.r - p2LocalPolarC1.r) > 0.0001) {
        throw new Error(
            'The radius of p1 and p2 is not the same. Check your input'
        );
    } else {
        p1LocalPolarC1.r = scaledOuterSizeC1;
        p2LocalPolarC1.r = scaledOuterSizeC1;
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

    let midpointP1P2PolarC1: polarCoordinate,
        midpointP3P4PolarC1: polarCoordinate;
    // calculate the midpoint between p1LocalPolar and p2LocalPolar consider that the midpoint of 3/2 pi and 1/2 pi is 0
    if (twoCase) {
        midpointP1P2PolarC1 = {
            r: scaledOuterSizeC1,
            theta: twoCase == 1 ? 0 : Math.PI
        };
        midpointP3P4PolarC1 = {
            r: p3LocalPolarC2.r,
            theta: twoCase == 1 ? 0 : Math.PI
        };
    } else {
        midpointP1P2PolarC1 = {
            r: scaledOuterSizeC1,
            theta: midPointPolar(p1LocalPolarC1.theta, p2LocalPolarC1.theta)
        };

        const midpointP3P4PolarC2 = {
            r: p3LocalPolarC2.r,
            theta: midPointPolar(p3LocalPolarC2.theta, p4LocalPolarC2.theta)
        };

        const midpointP3P4cartesianC2 = localToGlobal(
            polarToCartesian(midpointP3P4PolarC2.r, midpointP3P4PolarC2.theta),
            centerPosC2
        );
        midpointP3P4PolarC1 = cartesianToPolar(
            globalToLocal(midpointP3P4cartesianC2, centerPosC1)
        );
    }

    const adjustedTipPosition1 = {
        r: scaledOuterSizeC1,
        theta: midpointP3P4PolarC1.theta
    };

    const tipPosition1 = adjustedTipPosition1;

    // calculate the beginning of the "tip" of the arc (the point where the arc starts to bend) such that the angle between the tip and the midpoint is TIP_MAX_ANGLE or the radius of the arc, whichever is smaller

    const tipBaseP1Polar = {
        r: scaledOuterSizeC1,
        theta: subtractAngle(tipPosition1.theta, TIP_MAX_ANGLE / 2)
    };
    const tipBaseP2Polar = {
        r: scaledOuterSizeC1,
        theta: addAngle(tipPosition1.theta, TIP_MAX_ANGLE / 2)
    };

    const correctionAngle = TIP_MAX_ANGLE / 5;
    //check if the tip is within the arc

    if (twoCase) {
        tipPosition1.theta = twoCase == 1 ? 0 : Math.PI;
        const distSmallerThanTip =
            distancePolar(p1LocalPolarC1.theta, p2LocalPolarC1.theta) <
            TIP_MAX_ANGLE;
        if (distSmallerThanTip) {
            tipBaseP1Polar.theta = p1LocalPolarC1.theta;
            tipBaseP2Polar.theta = p2LocalPolarC1.theta;
        }
    } else if (
        distancePolar(p1LocalPolarC1.theta, p2LocalPolarC1.theta) <
        TIP_MAX_ANGLE
    ) {
        tipPosition1.theta = midpointP1P2PolarC1.theta;
        tipBaseP1Polar.theta = p1LocalPolarC1.theta;
        tipBaseP2Polar.theta = p2LocalPolarC1.theta;
    } else {
        if (
            !polarIsBetween(
                p1LocalPolarC1.theta,
                p2LocalPolarC1.theta,
                tipBaseP1Polar.theta
            ) &&
            !polarIsBetween(
                p1LocalPolarC1.theta,
                p2LocalPolarC1.theta,
                tipBaseP2Polar.theta
            )
        ) {
            const p1DistTip = distancePolar(
                tipPosition1.theta,
                p1LocalPolarC1.theta
            );
            const p2DistTip = distancePolar(
                p2LocalPolarC1.theta,
                tipPosition1.theta
            );
            if (p1DistTip < p2DistTip) {
                tipPosition1.theta = addAngle(
                    p1LocalPolarC1.theta,
                    correctionAngle
                );
                tipBaseP1Polar.theta = p1LocalPolarC1.theta;
                tipBaseP2Polar.theta = addAngle(
                    p1LocalPolarC1.theta,
                    TIP_MAX_ANGLE
                );
            } else {
                tipPosition1.theta = subtractAngle(
                    p2LocalPolarC1.theta,
                    correctionAngle
                );
                tipBaseP2Polar.theta = p2LocalPolarC1.theta;
                tipBaseP1Polar.theta = subtractAngle(
                    p2LocalPolarC1.theta,
                    TIP_MAX_ANGLE
                );
            }
        } else {
            if (
                !polarIsBetween(
                    p1LocalPolarC1.theta,
                    p2LocalPolarC1.theta,
                    tipBaseP1Polar.theta
                )
            ) {
                tipBaseP1Polar.theta = p1LocalPolarC1.theta;
                tipPosition1.theta = addAngle(
                    p1LocalPolarC1.theta,
                    correctionAngle
                );
                tipBaseP2Polar.theta = addAngle(
                    tipPosition1.theta,
                    TIP_MAX_ANGLE / 2
                );
            } else if (
                !polarIsBetween(
                    p1LocalPolarC1.theta,
                    p2LocalPolarC1.theta,
                    tipBaseP2Polar.theta
                )
            ) {
                tipBaseP2Polar.theta = p2LocalPolarC1.theta;
                tipPosition1.theta = subtractAngle(
                    p2LocalPolarC1.theta,
                    correctionAngle
                );
                tipBaseP1Polar.theta = subtractAngle(
                    tipBaseP2Polar.theta,
                    TIP_MAX_ANGLE / 2
                );
            }
        }
    }
    const p1tipbaseAngle = Math.abs(
        distancePolar(tipBaseP1Polar.theta, p1LocalPolarC1.theta)
    );
    const p2tipbaseAngle = Math.abs(
        distancePolar(p2LocalPolarC1.theta, tipBaseP2Polar.theta)
    );

    const tipBaseP1Cartesian = localToGlobal(
        polarToCartesian(tipBaseP1Polar.r, tipBaseP1Polar.theta),
        centerPosC1
    );
    const tipBaseP2Cartesian = localToGlobal(
        polarToCartesian(tipBaseP2Polar.r, tipBaseP2Polar.theta),
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
    offsetDistance: number,
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
    // const dotProduct =
    //     fromCenterToOffsetPointMain[0] * tipVector[0] +
    //     fromCenterToOffsetPointMain[1] * tipVector[1];
    // const angle = Math.acos(
    //     dotProduct /
    //         Math.sqrt(
    //             fromCenterToOffsetPointMain[0] *
    //                 fromCenterToOffsetPointMain[0] +
    //                 fromCenterToOffsetPointMain[1] *
    //                     fromCenterToOffsetPointMain[1]
    //         ) /
    //         Math.sqrt(tipVector[0] * tipVector[0] + tipVector[1] * tipVector[1])
    // );
    let tipVectorNormalized = [0, 0];
    // if (angle < (Math.PI * 2) / 2) {
    //     //mabye change back it seems that this case is not very prevalent
    //     console.log('angleCase', angle);
    //     // set the vector such that angles with 1/3 Pi
    //     const rot = (Math.sign(dotProduct) * -2 * Math.PI) / 2;
    //     const fromCenterToOffsetPointMainLength = Math.sqrt(
    //         fromCenterToOffsetPointMain[0] * fromCenterToOffsetPointMain[0] +
    //             fromCenterToOffsetPointMain[1] * fromCenterToOffsetPointMain[1]
    //     );
    //     const fromCenterToOffsetPointMainNormalized = [
    //         fromCenterToOffsetPointMain[0] / fromCenterToOffsetPointMainLength,
    //         fromCenterToOffsetPointMain[1] / fromCenterToOffsetPointMainLength
    //     ];

    //     tipVectorNormalized = [
    //         fromCenterToOffsetPointMainNormalized[0] * Math.cos(rot) -
    //             fromCenterToOffsetPointMainNormalized[1] * Math.sin(rot),
    //         fromCenterToOffsetPointMainNormalized[0] * Math.sin(rot) +
    //             fromCenterToOffsetPointMainNormalized[1] * Math.cos(rot)
    //     ];
    // }

    // calculate the length of the tip vector
    const tipVectorLength = Math.sqrt(
        tipVector[0] * tipVector[0] + tipVector[1] * tipVector[1]
    );

    // normalize the tip vector
    tipVectorNormalized = [
        tipVector[0] / tipVectorLength,
        tipVector[1] / tipVectorLength
    ];

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
    const TIP_LENGTH = 0.13;

    const tipPosition1Polar = cartesianToPolar(
        globalToLocal(tipPosition1Cartesian, centerPos)
    );

    const tipPosition2Polar = cartesianToPolar(
        globalToLocal(tipPosition2Cartesian, centerPos)
    );
    // check if tipPosition2Polar in the semicircle right of tipPosition1Polar
    const pos1PlusHalfPi = addAngle(tipPosition1Polar.theta, Math.PI);
    const isClockwise = polarIsBetween(
        tipPosition1Polar.theta,
        pos1PlusHalfPi,
        tipPosition2Polar.theta
    );

    const angleDifference = distancePolar(
        isClockwise ? tipPosition1Polar.theta : tipPosition2Polar.theta,
        isClockwise ? tipPosition2Polar.theta : tipPosition1Polar.theta
    );

    // calculate the tip points from the tip polar coordinates
    // calculate the theat for the tip points such that it tilts towards tipPoint2Polar but not farther than the respective base point
    const tipPointTheta = () => {
        if (Math.abs(angleDifference) > 0.0) {
            return isClockwise
                ? addAngle(tipPosition1Polar.theta, angleDifference * 0.15)
                : subtractAngle(
                      tipPosition1Polar.theta,
                      angleDifference * 0.15
                  );
        } else {
            return tipPosition1Polar.theta;
        }
    };
    const distancePosition1Position2cartesian = Math.sqrt(
        (tipPosition1Cartesian[0] - tipPosition2Cartesian[0]) ** 2 +
            (tipPosition1Cartesian[1] - tipPosition2Cartesian[1]) ** 2
    );

    const tipPoint1Polar = {
        r: tipPosition1Polar.r * (1 + TIP_LENGTH),
        theta: tipPosition1Polar.theta
    };
    const tipPoint2Polar = {
        r: tipPoint1Polar.r + distancePosition1Position2cartesian / 4,
        theta: tipPointTheta()
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
    // generate quadratic curve from tipBaseP1Cartesian to tipPoint1Cartesian with midpoinP1P2Cartesian as control point
    const quadraticCurve_tipBaseP1_tipPoint1 = `M ${tipPoint1Cartesian[0]} ${tipPoint1Cartesian[1]} Q ${tipPointControlCartesian1[0]} ${tipPointControlCartesian1[1]} ${tipBaseP1Cartesian[0]} ${tipBaseP1Cartesian[1]}`;
    //generate an svg arc from p1Cartesian to tipBaseP1Cartesian
    //const arc_P1_tipBase = `M${p2[0]} ${p2[1]}  A ${radius} ${radius} 0 0 1 ${p1[0]} ${p1[1]}`;
    const arc_P1_tipBase = `A ${radius} ${radius} 0 ${
        p1BaseAngle >= Math.PI ? 0 : 1
    } 0 ${p1Cartesian[0]} ${p1Cartesian[1]}`;
    const line_P1_center = `L ${centerPos.x} ${centerPos.y}`;
    const line_center_P2 = `L ${p2Cartesian[0]} ${p2Cartesian[1]}`;
    //generate an svg arc from tipBaseP2Cartesian to p2Cartesian
    const arc_P2_tipBaseP2 = `A ${radius} ${radius} 0 ${
        p2BaseAngle >= Math.PI ? 0 : 1
    } 0 ${tipBaseP2Cartesian[0]} ${tipBaseP2Cartesian[1]}`;
    // generate svg quadratic curve from tipPoint1Cartesian to tipBaseP2Cartesian
    const quadraticCurve_tipBaseP2_tipPoint2 = `Q ${tipPointControlCartesian2[0]} ${tipPointControlCartesian2[1]} ${tipPoint2Cartesian[0]} ${tipPoint2Cartesian[1]}`;

    // merge the paths

    return `${quadraticCurve_tipBaseP1_tipPoint1} ${arc_P1_tipBase} ${line_P1_center} ${line_center_P2} ${arc_P2_tipBaseP2} ${quadraticCurve_tipBaseP2_tipPoint2}`;
}

function getPath(
    start: {
        graphCenterPos: { x: number; y: number; id: string; outerSize: number };
        pos: { x: number; y: number };
    }[],
    end: {
        graphCenterPos: { x: number; y: number; id: string; outerSize: number };
        pos: { x: number; y: number };
    }[],
    twoCase = false
) {
    const firstPos: [number, number] = [start[0].pos.x, start[0].pos.y];
    const secondPos: [number, number] = [start[1].pos.x, start[1].pos.y];

    const avgCircleDiameter =
        (start[0].graphCenterPos.outerSize + end[0].graphCenterPos.outerSize) /
        2;
    const RADIUS_SCALE = 1.1;

    const thirdPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const fourthPos: [number, number] = [end[1].pos.x, end[1].pos.y];

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
        RADIUS_SCALE,
        start[0].graphCenterPos,
        end[0].graphCenterPos,
        twoCase ? 1 : false
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
        RADIUS_SCALE,
        end[0].graphCenterPos,
        start[0].graphCenterPos,
        twoCase ? 2 : false
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

    const distanceBetweenStartPoints = Math.sqrt(
        (tipBaseP2Cartesian[0] - tipBaseP1Cartesian[0]) ** 2 +
            (tipBaseP2Cartesian[1] - tipBaseP1Cartesian[1]) ** 2
    );
    const outerSize = avgCircleDiameter * 2 * Math.PI * 0.007;

    const OFFSET_SCALE_1 =
        distanceBetweenStartPoints > outerSize ||
        distanceBetweenStartPoints < 0.1
            ? outerSize
            : distanceBetweenStartPoints / 3;

    const [
        tipPoint1OffsetCartesianNeg,
        tipPoint1OffsetCartesianPos,
        tipPoint1ControlOffsetCartesianNeg,
        tipPoint1ControlOffsetCartesianPos,
        connectorControl1OffsetCartesianNeg,
        connectorControl1OffsetCartesianPos
    ] = offsetTips(
        tipPoint1Cartesian,
        tipPoint2Cartesian,
        tipPointControlCartesian,
        tipPoint2Cartesian,
        OFFSET_SCALE_1,
        [start[0].graphCenterPos.x, start[0].graphCenterPos.y]
    );

    const distanceBetweenEndPoints = Math.sqrt(
        (tipBaseP4Cartesian[0] - tipBaseP3Cartesian[0]) ** 2 +
            (tipBaseP4Cartesian[1] - tipBaseP3Cartesian[1]) ** 2
    );
    const OFFSET_SCALE_2 =
        distanceBetweenEndPoints > outerSize || distanceBetweenEndPoints < 0.1
            ? outerSize
            : distanceBetweenEndPoints / 3;

    const [
        tipPoint2OffsetCartesianNeg,
        tipPoint2OffsetCartesianPos,
        tipPoint2ControlOffsetCartesianNeg,
        tipPoint2ControlOffsetCartesianPos,
        connectorControl2OffsetCartesianNeg,
        connectorControl2OffsetCartesianPos
    ] = offsetTips(
        tipPoint3Cartesian,
        tipPoint4Cartesian,
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
        start[0].graphCenterPos.outerSize * RADIUS_SCALE
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
        end[0].graphCenterPos.outerSize * RADIUS_SCALE
    );

    const connector1 = `
    C ${connectorControl1OffsetCartesianPos[0]} ${connectorControl1OffsetCartesianPos[1]} ${connectorControl2OffsetCartesianNeg[0]} ${connectorControl2OffsetCartesianNeg[1]} ${tipPoint2OffsetCartesianNeg[0]} ${tipPoint2OffsetCartesianNeg[1]}
    `;
    const connector2 = `
    C ${connectorControl2OffsetCartesianPos[0]} ${connectorControl2OffsetCartesianPos[1]} ${connectorControl1OffsetCartesianNeg[0]} ${connectorControl1OffsetCartesianNeg[1]} ${tipPoint1OffsetCartesianNeg[0]} ${tipPoint1OffsetCartesianNeg[1]}
    `;
    return [arc1 + connector1 + arc2 + connector2];
}

const EgoGraphBand = (props: EgoGraphBandProps) => {
    const { bandData, color, twoCase } = props;
    const [selectedBand, setSelectedBand] = useAtom(selectedBandAtom);
    let pathData: { path: string[]; color: string; id: string }[] = [];
    if (Object.values(bandData[1]).length === 0) return null;
    if (Object.values(bandData[1]).length === 1) return null;
    if (Object.values(bandData[1]).length === 2) {
        const start = Object.values(bandData[1])[0];
        const end = Object.values(bandData[1])[1];
        pathData = [
            {
                path: getPath(start, end, twoCase),
                color: color,
                id: bandData[0]
            }
        ];
    }
    if (Object.keys(bandData[1]).length === 3) {
        const start = Object.values(bandData[1])[0];
        const mid = Object.values(bandData[1])[1];
        const end = Object.values(bandData[1])[2];

        //make a path consisting of 3 bands, one for each pair of nodes
        //start to mid, mid to end, end to start
        // todo: at the moment the resulting paths are not a union of the three bands but thre separate bands maybe use something like paper.js to do union them
        // push start to mid
        pathData.push({
            path: getPath(start, mid),
            color: color,
            id: bandData[0]
        });
        // push mid to end
        pathData.push({
            path: getPath(mid, end),
            color: color,
            id: bandData[0]
        });
        // push end to start
        pathData.push({
            path: getPath(end, start),
            color: color,
            id: bandData[0]
        });
    }

    return pathData.map((pathDatum, i) => (
        <g key={i}>
            <path
                d={pathDatum.path[0]}
                className="band"
                stroke={'red'}
                opacity={1}
                strokeWidth={selectedBand === pathDatum.id ? '4' : '0'}
                fill={pathDatum.color}
                onClick={() => {
                    setSelectedBand(
                        selectedBand == pathDatum.id ? '' : pathDatum.id
                    );
                }}
            />
        </g>
    ));
};

export default EgoGraphBand;
