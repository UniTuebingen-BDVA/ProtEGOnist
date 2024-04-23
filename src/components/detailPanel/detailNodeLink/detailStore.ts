import { atom } from 'jotai';

// link atom
const linkStoreAtom = atom<{
    [key: string]: { source: string; target: string; id: string };
}>({});

export const linkAtom = atom(
    (get) => {
        const linkDict = get(linkStoreAtom);
        // get x1, y1, x2, y2
        const links = Object.values(linkDict).map((link) => {
            return {
                id: link.id,
                x1: get(nodeStoreAtom)[link.source].cx,
                y1: get(nodeStoreAtom)[link.source].cy,
                x2: get(nodeStoreAtom)[link.target].cx,
                y2: get(nodeStoreAtom)[link.target].cy
            };
        });
        return links;
    },
    (_get, set, links: { source: string; target: string; id: string }[]) => {
        const linkDict: {
            [key: string]: { source: string; target: string; id: string };
        } = {};
        links.forEach((link) => {
            linkDict[link.id] = link;
        });
        set(linkStoreAtom, linkDict);
    }
);
// node atom
const nodeStoreAtom = atom<{
    [key: string]: {
        id: string;
        fill: string;
        size: number;
        cx: number;
        cy: number;
    };
}>({});

export const nodeAtom = atom(
    (get) => {
        return get(nodeStoreAtom);
    },
    (
        _get,
        set,
        nodes: {
            id: string;
            fill: string;
            size: number;
            cx: number;
            cy: number;
        }[]
    ) => {
        const nodeDict: {
            [key: string]: {
                id: string;
                fill: string;
                size: number;
                cx: number;
                cy: number;
            };
        } = {};
        nodes.forEach((node) => {
            nodeDict[node.id] = node;
        });
        set(nodeStoreAtom, nodeDict);
    }
);
