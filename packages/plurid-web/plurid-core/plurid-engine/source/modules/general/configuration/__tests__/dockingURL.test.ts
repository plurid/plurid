import {
    resolveDockingURL,
} from '..';



describe('resolveDockingURL', () => {
    it('unset or false is no binding; true is both directions on the pathname with history entries', () => {
        expect(resolveDockingURL(undefined)).toBeNull();
        expect(resolveDockingURL(false)).toBeNull();
        expect(resolveDockingURL(true)).toEqual({ write: true, restore: true, history: 'push', mode: 'path', param: 'page' });
    });

    it('an object sets the flags; both directions off is no binding; a param selects the query mode with replace', () => {
        expect(resolveDockingURL({ write: false })).toMatchObject({ write: false, restore: true, mode: 'path', history: 'push' });
        expect(resolveDockingURL({ write: false, restore: false })).toBeNull();
        expect(resolveDockingURL({ history: 'replace' })).toMatchObject({ history: 'replace', mode: 'path' });
        expect(resolveDockingURL({ param: 'p' })).toEqual({ write: true, restore: true, history: 'replace', mode: 'query', param: 'p' });
        expect(resolveDockingURL({ param: 'p', history: 'push' })).toMatchObject({ history: 'push', mode: 'query' });
    });

    it('inside a host router the query mode and replace are forced', () => {
        expect(resolveDockingURL(true, { router: true })).toEqual({ write: true, restore: true, history: 'replace', mode: 'query', param: 'page' });
        expect(resolveDockingURL({ history: 'push', param: 'where' }, { router: true })).toMatchObject({ history: 'replace', mode: 'query', param: 'where' });
        expect(resolveDockingURL(false, { router: true })).toBeNull();
    });
});
