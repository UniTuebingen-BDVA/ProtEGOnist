import { RefObject, useMemo, useSyncExternalStore } from 'react';

export function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInRadians: number,
    offset: number = 0,
) {
    return {
        x: centerX + radius * Math.cos(angleInRadians+offset),
        y: centerY + radius * Math.sin(angleInRadians+offset)
    };
}

export function getPartialRanges(numRanges: number) {
    const fullRange = 2 * Math.PI;
    const partialRange = fullRange / numRanges;
    const ranges = [];
    for (let i = 0; i < numRanges; i++) {
        ranges.push(
            [[i * partialRange, (i+1) * partialRange],
            [(i+1) * partialRange, fullRange]]
        );
    }
    return(ranges)
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
