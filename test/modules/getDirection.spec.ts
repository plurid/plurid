import { getWheelDirection } from '../../src/';

describe('getWheelDirection', () => {
    it('returns "left" direction', () => {
        const event = {
            deltaX: 20,
            deltaY: 0
        };
        expect(getWheelDirection(event)).toBe('left');
    });

    it('returns "right" direction', () => {
        const event = {
            deltaX: -20,
            deltaY: 0
        };
        expect(getWheelDirection(event)).toBe('right');
    });

    it('returns "up" direction', () => {
        const event = {
            deltaX: 0,
            deltaY: 10
        };
        expect(getWheelDirection(event)).toBe('up');
    });

    it('returns "down" direction', () => {
        const event = {
            deltaX: 0,
            deltaY: -10
        };
        expect(getWheelDirection(event)).toBe('down');
    });
});
