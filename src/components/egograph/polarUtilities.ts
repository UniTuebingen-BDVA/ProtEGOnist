export type polarCoordinate = {
    r: number;
    theta: number;
};

export function globalToLocal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] - center.x, point[1] - center.y];
}

export function localToGlobal(
    point: [number, number],
    center: { x: number; y: number }
): [number, number] {
    return [point[0] + center.x, point[1] + center.y];
}

export function cartesianToPolar(point: [number, number]) {
    const r = Math.sqrt(point[0] * point[0] + point[1] * point[1]);
    const theta =
        (Math.atan2(point[1], point[0]) + 2 * Math.PI) % (2 * Math.PI);
    return { r, theta };
}
export function polarToCartesian(
    radius: number,
    angleInRadians: number
): [number, number] {
    return [
        radius * Math.cos(angleInRadians),
        radius * Math.sin(angleInRadians)
    ];
}

export function midPointPolar(p1Theta: number, p2Theta: number) {
    if (p1Theta > p2Theta) {
        const p2To2Pi = -1 * (2 * Math.PI - p2Theta);
        return (p1Theta + p2To2Pi) / 2;
    } else {
        return p2Theta - (p2Theta - p1Theta) / 2;
    }
}
export function distancePolar(p1Theta: number, p2Theta: number) {
    if (p1Theta > p2Theta) {
        const p1To2Pi = Math.abs(2 * Math.PI - p1Theta);
        return p2Theta + p1To2Pi;
    } else {
        return p2Theta - p1Theta;
    }
}

export function polarIsBetween(
    p1Theta: number,
    p2Theta: number,
    theta: number
) {
    if (p1Theta > p2Theta) {
        return theta > p1Theta || theta < p2Theta;
    } else {
        return theta > p1Theta && theta < p2Theta;
    }
}
export function subtractAngle(theta: number, epsilon: number) {
    if (theta - epsilon < 0) {
        const remainder = theta - epsilon;
        return 2 * Math.PI + remainder;
    } else return theta - epsilon;
}

export function addAngle(theta: number, epsilon: number) {
    if (theta + epsilon > 2 * Math.PI) {
        const remainder = theta + epsilon - 2 * Math.PI;
        return remainder;
    } else return theta + epsilon;
}
