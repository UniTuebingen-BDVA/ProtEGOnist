import { atom } from 'jotai';
import { egoNetworkNetwork } from '../../egoGraphSchema';

export const egoNetworkNetworkSizeAtom = atom({
    width: 1000,
    height: 1000,
    x: 0,
    y: 0
});

export const decollapseIDsAtom = atom<string[]>(['Q15369', 'P30533']);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});
