import { atom } from 'jotai';

// link atom
/**
 * Atom representing the link store.
 */
const linkStoreAtom = atom<{
    [key: string]: {
        source: {
            id: string;
            fill: string;
            size: number;
            x: number;
            y: number;
        };
        target: {
            id: string;
            fill: string;
            size: number;
            x: number;
            y: number;
        };
        id: string;
    };
}>({});

/**
 * Atom representing the link data in the detail panel.
 * @returns An array of link objects with x1, y1, x2, y2 coordinates.
 */
export const linkAtom = atom(
    (get) => {
        const linkDict = get(linkStoreAtom);
        // get x1, y1, x2, y2
        const links = Object.values(linkDict).map((link) => {
            const sourceNode = link.source;
            const targetNode = link.target;
            return {
                id: link.id,
                x1: sourceNode.x,
                y1: sourceNode.y,
                x2: targetNode.x,
                y2: targetNode.y
            };
        });
        return links;
    },
    (
        _get,
        set,
        links: { [key: string]: { source: string; target: string; id: string } }
    ) => {
        set(linkStoreAtom, links);
    }
);
// node atom
const nodeStoreAtom = atom<{
    [key: string]: {
        id: string;
        fill: string;
        size: number;
        x: number;
        y: number;
    };
}>({});

export const nodeAtom = atom(
    (get) => {
        const nodes = get(nodeStoreAtom);
        return Object.values(nodes);
    },
    (
        _get,
        set,
        nodes: {
            [key: string]: {
                id: string;
                fill: string;
                size: number;
                x: number;
                y: number;
            };
        }
    ) => {
        set(nodeStoreAtom, nodes);
    }
);
