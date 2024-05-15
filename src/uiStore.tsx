import { atom } from 'jotai';
import { RefObject } from 'react';

const remToPxBaseAtom = atom(
    parseFloat(getComputedStyle(document.documentElement).fontSize)
);
export const remToPxAtom = atom(
    (get) => get(remToPxBaseAtom),
    (_get, set) =>
        set(
            remToPxBaseAtom,
            parseFloat(getComputedStyle(document.documentElement).fontSize)
        )
);
export const svgFontSizeAtom = atom(
    (get) => get(remToPxAtom)/1.7
);
const windowSizeBaseAtom = atom({
    width: window.innerWidth,
    height: window.innerHeight
});
export const windowSizeAtom = atom(
    (get) => get(windowSizeBaseAtom),
    (_get, set) => {
        set(windowSizeBaseAtom, {
            width: window.innerWidth,
            height: window.innerHeight
        });
    }
);

const totalDrawWidth = 1500;
const resizeFactorAtom = atom(
    (get) => totalDrawWidth / get(windowSizeAtom).width
);
const overviewSVGSizeBaseAtom = atom({
    width: window.innerWidth * 0.45,
    height: window.innerHeight * 0.48
});
export const overviewSVGSizeAtom = atom(
    (get) => {
        return get(overviewSVGSizeBaseAtom);
    },
    (get, set, update: { width: number; height: number }) => {
        set(overviewSVGSizeBaseAtom, {
            width: update.width * get(resizeFactorAtom),
            height: update.height * get(resizeFactorAtom)
        });
    }
);

const subnetworkSVGSizeBaseAtom = atom({
    width: window.innerWidth * 0.55,
    height: window.innerHeight
});
export const subNetworkSVGSizeAtom = atom(
    (get) => {
        return get(subnetworkSVGSizeBaseAtom);
    },
    (get, set, update: { width: number; height: number }) => {
        set(subnetworkSVGSizeBaseAtom, {
            width: update.width * get(resizeFactorAtom),
            height: update.height * get(resizeFactorAtom)
        });
    }
);
const detailedSVGSizeBaseAtom = atom({
    width: window.innerWidth * 0.3,
    height: window.innerHeight * 0.45
});
export const detailedSVGSizeAtom = atom(
    (get) => {
        return get(detailedSVGSizeBaseAtom);
    },
    (get, set, update: { width: number; height: number }) => {
        set(detailedSVGSizeBaseAtom, {
            width: update.width * get(resizeFactorAtom),
            height: update.height * get(resizeFactorAtom)
        });
    }
);
export const resizeEffect = (
    containerRef: RefObject<HTMLDivElement>,
    setSvgSize: (bcg: DOMRect) => void
) => {
    const node = containerRef.current;
    if (node) {
        setSvgSize(node.getBoundingClientRect());
        window.addEventListener('resize', () =>
            setSvgSize(node.getBoundingClientRect())
        );
        return () => {
            window.removeEventListener('resize', () =>
                setSvgSize(node.getBoundingClientRect())
            );
        };
    }
};
