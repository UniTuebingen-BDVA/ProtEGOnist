import { sortInnerNodes } from '../components/egograph/egolayout.ts';
import { expect } from 'chai';

describe('Sort inner nodes', () => {
    let distanceMatrix = [
        [-1, 2, 5, 7],
        [-1, -1, 5, 2],
        [-1, -1, -1, 6],
        [-1, -1, -1, -1]
    ];
    let sortedIndices = sortInnerNodes(distanceMatrix);
    console.log(sortedIndices);
    it('check of the order is correct', () => {
        expect(sortedIndices.to.eql([0, 2, 3, 1]));
    });
});
