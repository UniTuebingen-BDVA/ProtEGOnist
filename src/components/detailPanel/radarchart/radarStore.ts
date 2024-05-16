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

export const hoveredLabelAtom = atom<string>('');

const defaultLabelsAtom = atom((get) => {
    const labels = Object.values(get(intersectionAtom)).map(
        (d) => d.classification
    );
    const uniqueLabels = [...new Set(labels)];
    const labelsInternal: {
        [name: string]: { value: string; short: string; long: string };
    } = {};
    uniqueLabels.forEach((d) => {
        const short = d.length > 15 ? d.slice(0, 15) + '...' : d;
        labelsInternal[d] = {
            value: short,
            short: short,
            long: d
        };
    });
    return labelsInternal;
});

export const labelsAtoms = atom((get) => {
    const hoveredLabel = get(hoveredLabelAtom);
    const defaultLabels = get(defaultLabelsAtom);
    if (hoveredLabel === '') {
        return defaultLabels;
    } else {
        const labelsInternal: {
            [name: string]: { value: string; short: string; long: string };
        } = {};
        Object.keys(defaultLabels).forEach((key) => {
            if (key === hoveredLabel) {
                labelsInternal[key] = {
                    ...defaultLabels[key],
                    value: defaultLabels[key].long
                };
            } else {
                labelsInternal[key] = { ...defaultLabels[key], value: '' };
            }
        });
        return labelsInternal;
    }
});

export const lastSelectedNodeAtom = atom<string>('');
