import { Atom, atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { intersectionDatum } from '../../egoGraphSchema';
import * as d3 from 'd3';
export const radarSVGSizeAtom = atom({ width: 400, height: 400 });

export const changedNodesAtom = atom<string[]>([]);
export const leavingNodesAtom = atom<string[]>([]);

export const intersectionAtom = atom<{
    [name: string]: intersectionDatum;
}>({});

export const tarNodeAtom = atom<string>('');

export const lableInternalAtom = atom<{
    [name: string]: { value: string; short: string; long: string };
}>({});

export const colorScaleAtom = atom((get) => {
    // colorscale that maps each classification to a color
    return Object.keys(get(lableInternalAtom)).length > 0
        ? d3
              .scaleOrdinal()
              .domain(
                  Object.values(get(intersectionAtom)).map(
                      (d) => d.classification
                  )
              )
              .range(d3.schemeCategory10)
        : d3.scaleOrdinal().domain(['']).range(['white']);
});

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
        console.log('here', id);
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
