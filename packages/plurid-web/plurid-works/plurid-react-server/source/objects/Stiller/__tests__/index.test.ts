// #region imports
    // #region external
    import {
        replacePluridResolution,
    } from '../';
    // #endregion external
// #endregion imports



// #region module
// `Stiller.still()` drives Puppeteer against a live server (an integration concern, exercised manually).
// `replacePluridResolution` is its one pure, deterministic piece — unit-test that.
describe('Stiller — replacePluridResolution', () => {
    it('collapses the render viewport to zero to avoid the loading flash', () => {
        const html = '<div style="width: 1366px; height: 768px;">content</div>';
        expect(replacePluridResolution(html)).toBe('<div style="width: 0px; height: 0px;">content</div>');
    });

    it('leaves html without the render viewport untouched', () => {
        const html = '<div style="color: red;">content</div>';
        expect(replacePluridResolution(html)).toBe(html);
    });
});
// #endregion module
