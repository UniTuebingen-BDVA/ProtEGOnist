import { atom } from 'jotai';
import { egoNetworkNetwork } from '../../egoGraphSchema';

export const egoNetworkNetworkSizeAtom = atom({ width: 400, height: 400 });

export const egoNetworkNetworksAtom = atom<egoNetworkNetwork>({
    nodes: [],
    edges: []
});
