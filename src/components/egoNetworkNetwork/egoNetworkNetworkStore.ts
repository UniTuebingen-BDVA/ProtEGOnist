import { atom } from 'jotai';
import { egoNetworkNetwork } from '../../egoGraphSchema';

export const egoNetworkNetworkSizeAtom = atom({ width: 400, height: 400 });

export const decollapseIDsAtom = atom<string[][]>([['Q15369', 'P30533'],['Q15369', 'P30533']]);

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});
