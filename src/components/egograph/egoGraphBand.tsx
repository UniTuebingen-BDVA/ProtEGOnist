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

function globalToLocal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] - center.x, point[1] - center.y];
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

function localToGlobal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] + center.x, point[1] + center.y];
}

function generatePath(
    p1: [number, number],
    p2: [number, number],
    radius: number,
    centerPos: { x: number; y: number }
) {
    const tipLength = 0.2; // TODO if we change the circles to have different radii, we probably need to change this as well to a fixes length

    const TIP_MAX_ANGLE = 0.7; //rad

    let p1Cartesian = structuredClone(p1);
    let p2Cartesian = structuredClone(p2);

    let p1LocalPolar = cartesianToPolar(globalToLocal(p1Cartesian, centerPos));
    let p2LocalPolar = cartesianToPolar(globalToLocal(p2Cartesian, centerPos));

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

    // calculate the beginning of the "tip" of the arc (the point where the arc starts to bend) such that the angle between the tip and the midpoint is TIP_MAX_ANGLE or the radius of the arc, whichever is smaller
    const tipBaseP1Polar = {
        r: radius,
        theta: midpointP1P2Polar.theta - TIP_MAX_ANGLE / 2
    };
    const tipBaseP2Polar = {
        r: radius,
        theta: midpointP1P2Polar.theta + TIP_MAX_ANGLE / 2
    };
    //check if the tip is within the arc
    if (tipBaseP1Polar.theta < p1LocalPolar.theta) {
        tipBaseP1Polar.theta = p1LocalPolar.theta;
    }
    if (tipBaseP2Polar.theta > p2LocalPolar.theta) {
        tipBaseP2Polar.theta = p2LocalPolar.theta;
    }

    // calculate the tip points from the tip polar coordinates
    const tipPoint1Polar = {
        r: midpointP1P2Polar.r * (1 + tipLength),
        theta: midpointP1P2Polar.theta
    };
    const tipPoint2Polar = {
        r: midpointP1P2Polar.r * (1 + tipLength * 2),
        theta: midpointP1P2Polar.theta
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
    const tipBaseP1Cartesian = localToGlobal(
        polarToCartesian(tipBaseP1Polar.r, tipBaseP1Polar.theta),
        centerPos
    );
    const tipBaseP2Cartesian = localToGlobal(
        polarToCartesian(tipBaseP2Polar.r, tipBaseP2Polar.theta),
        centerPos
    );
    const midpointP1P2Cartesian = localToGlobal(
        polarToCartesian(midpointP1P2Polar.r, midpointP1P2Polar.theta),
        centerPos
    );

    //generate an svg arc from p1Cartesian to tipBaseP1Cartesian
    //const arc_P1_tipBase = `M${p2[0]} ${p2[1]}  A ${radius} ${radius} 0 0 1 ${p1[0]} ${p1[1]}`;
    const arc_P1_tipBase = `M ${p1Cartesian[0]} ${p1Cartesian[1]} A ${radius} ${radius} 0 0 1 ${tipBaseP1Cartesian[0]} ${tipBaseP1Cartesian[1]}`;
    // generate quadratic curve from tipBaseP1Cartesian to tipPoint1Cartesian with midpoinP1P2Cartesian as control point
    const quadraticCurve_tipBaseP1_tipPoint1 = `Q ${midpointP1P2Cartesian[0]} ${midpointP1P2Cartesian[1]} ${tipPoint1Cartesian[0]} ${tipPoint1Cartesian[1]}`;
    // generate svg quadratic curve from tipPoint1Cartesian to tipBaseP2Cartesian
    const quadraticCurve_tipPoint1_tipBaseP2 = `Q ${midpointP1P2Cartesian[0]} ${midpointP1P2Cartesian[1]} ${tipBaseP2Cartesian[0]} ${tipBaseP2Cartesian[1]}`;
    //generate an svg arc from tipBaseP2Cartesian to p2Cartesian
    const arc_tipBaseP2_P2 = `A ${radius} ${radius} 0 0 1 ${p2Cartesian[0]} ${p2Cartesian[1]}`;
    // draw a line from p2Cartesian to centerPos and close it
    const line_P2_center = `L ${centerPos.x} ${centerPos.y} Z`;
    // merge the paths
    //return `${arc_P1_tipBase} ${line_P2_center}`;
    return [
        [tipPoint1Cartesian, tipPoint2Cartesian],
        `${arc_P1_tipBase} ${quadraticCurve_tipBaseP1_tipPoint1} ${quadraticCurve_tipPoint1_tipBaseP2} ${arc_tipBaseP2_P2} ${line_P2_center}`
    ];
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
    const RADIUS_SCALE = 1.05;

    const firstPos: [number, number] = [start[0].pos.x, start[0].pos.y];
    const secondPos: [number, number] = [start[1].pos.x, start[1].pos.y];

    const thirdPos: [number, number] = [end[0].pos.x, end[0].pos.y];
    const fourthPos: [number, number] = [end[1].pos.x, end[1].pos.y];

    const [tippoints1, arc1] = generatePath(
        firstPos,
        secondPos,
        radius * RADIUS_SCALE,
        start[0].graphCenterPos
    );
    const [tippoints2, arc2] = generatePath(
        thirdPos,
        fourthPos,
        radius * RADIUS_SCALE,
        end[0].graphCenterPos
    );
    const connector = `M ${tippoints1[0][0]} ${tippoints1[0][1]} C ${tippoints1[1][0]} ${tippoints1[1][1]} ${tippoints2[1][0]} ${tippoints2[1][1]} ${tippoints2[0][0]} ${tippoints2[0][1]}`;
    return [connector, arc1 + arc2];
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
                path: getPath(start, end, radius),
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
            path: getPath(start, mid, radius),
            color: 'coral'
        });
        // push mid to end
        pathData.push({
            path: getPath(mid, end, radius),
            color: 'coral'
        });
        // push end to start
        pathData.push({
            path: getPath(end, start, radius),
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
