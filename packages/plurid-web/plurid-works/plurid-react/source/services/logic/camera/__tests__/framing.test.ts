// #region imports
    // #region libraries
    import {
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region internal
    import {
        framingOf,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
/**
 * HOW CLOSE A FRAMING COMES is the product's to set. It was two constants - a
 * 0.85 margin and a ceiling of 1, so a plane was never drawn larger than it is -
 * which on a wide screen leaves a reading card adrift in the middle of the view.
 */
const configuration = (
    framing?: { fill?: number; maxScale?: number },
): PluridConfiguration => ({
    space: {
        navigation: framing ? { framing } : {},
    },
} as PluridConfiguration);


describe('the framing a product asks for', () => {
    it('is what it always was when nothing is said', () => {
        expect(framingOf(configuration())).toEqual({ margin: 0.85 });
        expect(framingOf({ space: {} } as PluridConfiguration)).toEqual({ margin: 0.85 });
    });

    /**
     * A CEILING NOBODY SET IS NOT A CEILING OF 1. Every framing in the engine already carries its
     * own (`framePlane` never magnifies, a fit may go to `zoomMax`), and a `maxScale: undefined`
     * spread over them takes theirs away: a fit that used to fill the view with a small space
     * stopped at scale 1, which one visual baseline caught and nothing else would have.
     */
    it('leaves a ceiling nobody set out of the answer', () => {
        expect('maxScale' in framingOf(configuration())).toBe(false);
        expect('maxScale' in framingOf(configuration({ fill: 0.9 }))).toBe(false);
    });

    it('takes the fill and the ceiling the product sets', () => {
        expect(framingOf(configuration({ fill: 0.96, maxScale: 2.5 }))).toEqual({ margin: 0.96, maxScale: 2.5 });
        expect(framingOf(configuration({ fill: 0.96 }))).toEqual({ margin: 0.96 });
        expect(framingOf(configuration({ maxScale: 3 }))).toEqual({ margin: 0.85, maxScale: 3 });
    });

    it('never fills more than the view, and never takes a nonsense for an answer', () => {
        expect(framingOf(configuration({ fill: 4 })).margin).toBe(1);
        expect(framingOf(configuration({ fill: 0 }))).toEqual({ margin: 0.85 });
        expect(framingOf(configuration({ fill: -1, maxScale: -2 }))).toEqual({ margin: 0.85 });
        expect(framingOf(configuration({ fill: NaN as number }))).toEqual({ margin: 0.85 });
    });
});
// #endregion module
