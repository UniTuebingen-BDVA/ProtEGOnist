import { atom } from 'jotai';
import { intersectionDatum } from '../../../egoGraphSchema';

export const changedNodesAtom = atom((get) => {
    return get(radarNodesAtom).changed;
});
export const leavingNodesAtom = atom((get) => {
    return get(radarNodesAtom).leaving;
});

export const intersectionAtom = atom((get) => {
    return get(radarNodesAtom).intersection;
});

export const radarNodesAtom = atom<{
    changed: string[];
    leaving: string[];
    intersection: {
        [name: string]: intersectionDatum;
    };
}>({
    changed: [],
    leaving: [],
    intersection: {}
});

export const tarNodeStoreAtom = atom<string>('');

export const tarNodeAtom = atom(
    (get) => {
        return get(tarNodeStoreAtom);
    },
    (get, set, id: string) => {
        set(lastSelectedNodeAtom, get(tarNodeStoreAtom));
        set(tarNodeStoreAtom, id);
    }
);

export const hoveredLabelAtom=atom<string>('')

const defaultLabels = atom((get) => {
    const labels = Object.values(get(intersectionAtom)).map(
        (d) => d.classification
    );
    const uniqueLabels = [...new Set(labels)];
    const labelsInternal: {
        [name: string]: { value: string; short: string; long: string };
    } = {};
    uniqueLabels.forEach((d) => {
        labelsInternal[d] = {
            value: d.length > 15 ? d.slice(0, 15) + '...' : d,
            short: d.length > 15 ? d.slice(0, 15) + '...' : d,
            long: d
        };
    });
    return labelsInternal;
});

export const labelsAtoms = atom(
    (get) => {
        const hoveredLabel=get(hoveredLabelAtom);
        if(hoveredLabel===''){
            return get(defaultLabels)
        } else{
            const labels = Object.values(get(intersectionAtom)).map(
            (d) => d.classification
        );
        const uniqueLabels = [...new Set(labels)];
        const labelsInternal: {
            [name: string]: { value: string; short: string; long: string };
        } = {};
        uniqueLabels.forEach((d) => {
            const shortenedLabel = d.length > 15 ? d.slice(0, 15) + '...' : d;
            labelsInternal[d] = {
                value: hoveredLabel == '' ? shortenedLabel : hoveredLabel == d ? d : '',
                short: shortenedLabel,
                long: d
            };
        });
        return labelsInternal
        }
    }
);

export const lastSelectedNodeAtom = atom<string>('');
