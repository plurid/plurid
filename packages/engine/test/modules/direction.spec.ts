import { getWheelDirection } from '../../src';

describe('getWheelDirection', () => {
    it('returns "left" direction', () => {
        const deltas = {
            deltaX: 20,
            deltaY: 0
        };
        expect(getWheelDirection(deltas)).toBe('left');
    });

    it('returns "right" direction', () => {
        const deltas = {
            deltaX: -20,
            deltaY: 0
        };
        expect(getWheelDirection(deltas)).toBe('right');
    });

    it('returns "up" direction', () => {
        const deltas = {
            deltaX: 0,
            deltaY: 10
        };
        expect(getWheelDirection(deltas)).toBe('up');
    });

    it('returns "down" direction', () => {
        const deltas = {
            deltaX: 0,
            deltaY: -10
        };
        expect(getWheelDirection(deltas)).toBe('down');
    });
});
