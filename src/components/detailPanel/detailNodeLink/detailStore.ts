import { atom } from 'jotai';

// link atom
/**
 * Atom representing the link store.
 */
const linkStoreAtom = atom<
    {
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
    }[]
>([{}]);

/**
 * Atom representing the link data in the detail panel.
 * @returns An array of link objects with x1, y1, x2, y2 coordinates.
 */
export const linkAtom = atom(
    (get) => {
        const linkDictArray = get(linkStoreAtom);
        // get x1, y1, x2, y2
        const linkDict = linkDictArray.reduce((acc, val) => {
            return { ...acc, ...val };
        }, {});
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
        links: {
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
        }[]
    ) => {
        set(linkStoreAtom, links);
    }
);
// node atom
const nodeStoreAtom = atom<
    {
        [key: string]: {
            id: string;
            component: number;
            size: number;
            x: number;
            y: number;
        };
    }[]
>([{}]);

export const nodeKeysAtom = atom((get) => {
    const nodesAtom = get(nodeStoreAtom);
    const nodes = nodesAtom.reduce((acc, val) => {
        return { ...acc, ...val };
    }, {});
    return Object.keys(nodes);
});

const selectedNodeAtomStore = atom('');
export const selectedNodeAtom = atom(
    (get) => get(selectedNodeAtomStore),
    (_get, set, value: string) => {
        set(selectedNodeAtomStore, value);
    }
);

export const nodeAtom = atom(
    (get) => {
        const nodesArray = get(nodeStoreAtom);
        // merge all nodes
        const nodes = nodesArray.reduce((acc, val) => {
            return { ...acc, ...val };
        }, {});
        return Object.values(nodes);
    },
    (
        _get,
        set,
        nodes: {
            [key: string]: {
                id: string;
                component: number;
                size: number;
                x: number;
                y: number;
            };
        }[]
    ) => {
        set(nodeStoreAtom, nodes);
    }
);
