// #region imports
    // #region internal
    import {
        domID,
    } from '../index';
    // #endregion internal
// #endregion imports



// #region module
describe('domID', () => {
    it('is short, stable, id-safe, and different for different planes', () => {
        const id = domID('plurid://localhost/docs?x=1@2');
        expect(id).toMatch(/^plurid-[a-z0-9]+$/);
        expect(id).toBe(domID('plurid://localhost/docs?x=1@2'));
        expect(id).not.toBe(domID('plurid://localhost/docs?x=1@3'));
        expect(id.length).toBeLessThan(16);
    });
});
// #endregion module
