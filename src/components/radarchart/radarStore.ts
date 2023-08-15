import { atom } from 'jotai';
import { intersectionDatum } from '../../egoGraphSchema';
export const radarSVGSizeAtom = atom({ width: 450, height: 450 });

export const changedNodesAtom = atom<string[]>([]);
export const leavingNodesAtom = atom<string[]>([]);

export const intersectionAtom = atom<{
    [name: string]: intersectionDatum;
}>({});

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

export const lableInternalAtom = atom<{
    [name: string]: { value: string; short: string; long: string };
}>({});

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
        return Object.keys(get(lableInternalAtom)).length > 0
            ? get(lableInternalAtom)
            : get(defaultLabels);
    },
    (get, set, id: string) => {
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
                value: id == '' ? shortenedLabel : id == d ? d : '',
                short: shortenedLabel,
                long: d
            };
        });
        set(lableInternalAtom, labelsInternal);
    }
);

export const lastSelectedNodeAtom = atom<string>('');
