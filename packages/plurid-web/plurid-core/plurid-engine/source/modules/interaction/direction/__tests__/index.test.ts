// #region imports
    // #region external
    import {
        getWheelDirection,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
xdescribe('getWheelDirection', () => {
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
// #endregion module
