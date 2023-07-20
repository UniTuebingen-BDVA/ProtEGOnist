import {
    getMaxIndex,
    sortInnerNodes
} from '../components/egograph/egolayout.ts';
import { expect } from 'chai';

describe('Sort inner nodes', () => {
    const distanceMatrix = [
        [-1, 3, 1, 0, 0],
        [-1, -1, 2, 5, 7],
        [-1, -1, -1, 5, 2],
        [-1, -1, -1, -1, 6],
        [-1, -1, -1, -1, -1]
    ];
    const max = getMaxIndex(distanceMatrix);
    const sortedIndices = sortInnerNodes(distanceMatrix);
    console.log(sortedIndices);
    it('check if global maximum is correct', () => {
        expect(max).to.eql([1, 4]);
    });
    it('check if the order is correct', () => {
        expect(sortedIndices).to.eql([0, 1, 4, 3, 2]);
    });
});
