import axios, { AxiosResponse } from 'axios';
import { atom } from 'jotai';
import { egoGraph } from './egoGraphSchema';
import { graphAtom } from './components/egograph/egoStore.ts';
import {
    intersectionAtom,
    tarNodeAtom
} from './components/radarchart/radarStore.ts';

import { calculateEgoLayout } from './components/egograph/egolayout.ts';
import {
    graphSizeAtom,
    innerRadiusAtom,
    outerRadiusAtom
} from './components/egograph/networkStore.ts';
//const [egoGraph, setEgoGraph] = useAtom(graphAtom);

export const getEgographAtom = atom(
    (get) => get(graphAtom),
    async (get, set, id: string) => {
        const result = await axios.get<egoGraph>(
            `/api/test_data_egograph/${id}`
        );
        const layout = calculateEgoLayout(
            result.data,
            get(innerRadiusAtom),
            get(outerRadiusAtom)
        );
        set(graphAtom, layout);
    }
);

export const getRadarAtom = atom(
    (get) => get(graphAtom),
    async (get, set, id: string) => {
        const result = await axios.get<egoGraph>(
            `/api/test_data_egograph/${id}`
        );
        const layout = calculateEgoLayout(
            result.data,
            get(innerRadiusAtom),
            get(outerRadiusAtom)
        );
        set(graphAtom, layout);
    }
);
