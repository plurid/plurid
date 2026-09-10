import {
    resolveDockingURL,
    normalizeDockingURLBase,
} from '..';



describe('resolveDockingURL', () => {
    it('unset or false is no binding; true is both directions on the pathname with history entries', () => {
        expect(resolveDockingURL(undefined)).toBeNull();
        expect(resolveDockingURL(false)).toBeNull();
        expect(resolveDockingURL(true)).toEqual({ write: true, restore: true, history: 'push', mode: 'path', param: 'page', base: '', orphan: 'root' });
    });

    it('an object sets the flags; both directions off is no binding; a param selects the query mode with replace', () => {
        expect(resolveDockingURL({ write: false })).toMatchObject({ write: false, restore: true, mode: 'path', history: 'push' });
        expect(resolveDockingURL({ write: false, restore: false })).toBeNull();
        expect(resolveDockingURL({ history: 'replace' })).toMatchObject({ history: 'replace', mode: 'path' });
        expect(resolveDockingURL({ param: 'p' })).toEqual({ write: true, restore: true, history: 'replace', mode: 'query', param: 'p', base: '', orphan: 'root' });
        expect(resolveDockingURL({ param: 'p', history: 'push' })).toMatchObject({ history: 'push', mode: 'query' });
    });

    it('inside a host router the query mode and replace are forced', () => {
        expect(resolveDockingURL(true, { router: true })).toEqual({ write: true, restore: true, history: 'replace', mode: 'query', param: 'page', base: '', orphan: 'root' });
        expect(resolveDockingURL({ history: 'push', param: 'where' }, { router: true })).toMatchObject({ history: 'replace', mode: 'query', param: 'where' });
        expect(resolveDockingURL(false, { router: true })).toBeNull();
    });

    it('a base is normalised (a leading slash, no trailing one) and dropped in the query mode; the orphan rule defaults to root', () => {
        expect(resolveDockingURL({ base: 'docs/' })).toMatchObject({ base: '/docs', orphan: 'root' });
        expect(resolveDockingURL({ base: '/docs/site//' })).toMatchObject({ base: '/docs/site' });
        expect(resolveDockingURL({ base: '//docs//site' })).toMatchObject({ base: '/docs/site' });
        expect(resolveDockingURL({ base: '/' })).toMatchObject({ base: '' });
        expect(resolveDockingURL({ base: '/docs', param: 'p' })).toMatchObject({ base: '', mode: 'query' });
        expect(resolveDockingURL({ base: '/docs' }, { router: true })).toMatchObject({ base: '' });
        expect(resolveDockingURL({ orphan: 'keep' })).toMatchObject({ orphan: 'keep' });
        expect(normalizeDockingURLBase(undefined)).toBe('');
        expect(normalizeDockingURLBase('  /a/b/ ')).toBe('/a/b');
    });
});
