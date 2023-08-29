import {
    calculateOverlaps,
    sortByOverlap
} from '../components/egograph/egolayout.ts';
import { expect } from 'chai';

describe('Sort nodes', () => {
    let nodeAssignment = new Map < string, string[] > (Object.entries({
        a: ['e1', 'e2', 'e3', 'e6'],
        b: ['e3', 'e4', 'e5'],
        c: ['e1', 'e2', 'e5', 'e7'],
        d: ['e3', 'e2', 'e1', 'e8']
    }));
    // nodeAssignmet to Map
    nodeAssignment = new Map(Object.entries(nodeAssignment));
    const innernodes = ['a', 'b', 'c', 'd'];
    const distanceMatrix = calculateOverlaps(nodeAssignment, innernodes);
    const sortedIndices = sortByOverlap(
        distanceMatrix,
        nodeAssignment,
        innernodes
    );
    it('check if overlap matrix is correct', () => {
        expect(distanceMatrix).to.eql([
            [[], ['e3'], ['e1', 'e2'], ['e1', 'e2', 'e3']],
            [[], [], ['e5'], ['e3']],
            [[], [], [], ['e1', 'e2']],
            [[], [], [], []]
        ]);
    });
    it('check if the inner node order is correct', () => {
        expect(sortedIndices.innerNodeOrder).to.eql(['b', 'c', 'a', 'd']);
    });
    it('check if the outer node order is correct',()=>{
        expect(sortedIndices.outerNodeOrder).to.eql(['e4','e5','e7','e6','e1','e2','e3','e8']);
    })
});
