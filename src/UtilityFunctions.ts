import { RefObject, useMemo, useSyncExternalStore } from 'react';

export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number,
    offset: number = 0
) {
    return {
        x: centerX + radius * Math.cos(angleInRadians + offset),
        y: centerY + radius * Math.sin(angleInRadians + offset)
    };
}

export function midPointPolar2PI(p1Theta: number, p2Theta: number) {
    if (p1Theta > p2Theta) {
        const p1To2PI = 2 * Math.PI - p1Theta;
        const p2To0PI = p2Theta;
        const offsetFromP1 = (p2To0PI + p1To2PI) / 2;
        return p1Theta + (offsetFromP1 % (2 * Math.PI));
    } else {
        const offsetFromP1 = (p2Theta - p1Theta) / 2;
        return p1Theta + offsetFromP1;
    }
}

export function getPartialRanges(
    numRanges: number
): [[number, number], [number, number]][] {
    const fullRange = 2 * Math.PI;
    const partialRange = fullRange / numRanges;
    const ranges: [[number, number], [number, number]][] = [];
    for (let i = 0; i < numRanges; i++) {
        ranges.push([
            [i * partialRange, (i + 1) * partialRange],
            [(i + 1) * partialRange, fullRange]
        ]);
    }
    return ranges;
}

export function createArcPath(
    x: number,
    y: number,
    radius: number,
    portion: number
) {
    const startCoords = polarToCartesian(x, y, radius, 0);
    const endCoords = polarToCartesian(x, y, radius, portion * 2 * Math.PI);
    let path = `M ${startCoords.x} ${startCoords.y}`;
    path += ` A ${radius} ${radius} 0 0 1 ${endCoords.x} ${endCoords.y}`;
    return path;
}

function subscribe(callback: (e: Event) => void) {
    window.addEventListener('resize', callback);
    return () => {
        window.removeEventListener('resize', callback);
    };
}

function useDimensions(ref: RefObject<HTMLElement>) {
    const dimensions = useSyncExternalStore(subscribe, () => {
        return JSON.stringify({
            width: ref.current?.offsetWidth ?? 0,
            height: ref.current?.offsetHeight ?? 0
        });
    });
    return useMemo(() => JSON.parse(dimensions), [dimensions]);
}

export { useDimensions };
