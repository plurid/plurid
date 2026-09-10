import {
    dockingURLTarget,
} from '..';



const path = { mode: 'path' as const, param: 'page', base: '' };
const docs = { ...path, base: '/docs' };
const query = { ...path, mode: 'query' as const };

describe('dockingURLTarget', () => {
    it('reads the pathname in the path mode: no trailing slash, the root as /', () => {
        expect(dockingURLTarget(path, { pathname: '/page-1/about/', search: '?x=1' })).toBe('/page-1/about');
        expect(dockingURLTarget(path, { pathname: '/', search: '' })).toBe('/');
        expect(dockingURLTarget(path, { pathname: '', search: '' })).toBe('/');
    });

    it('reads under the base, the base itself as the root, and nothing outside it', () => {
        expect(dockingURLTarget(docs, { pathname: '/docs/page-1', search: '' })).toBe('/page-1');
        expect(dockingURLTarget(docs, { pathname: '/docs/', search: '' })).toBe('/');
        expect(dockingURLTarget(docs, { pathname: '/docs', search: '' })).toBe('/');
        expect(dockingURLTarget(docs, { pathname: '/documents/page-1', search: '' })).toBeNull();
        expect(dockingURLTarget(docs, { pathname: '/', search: '' })).toBeNull();
    });

    it('reads the parameter in the query mode, decoded, the base ignored', () => {
        expect(dockingURLTarget(query, { pathname: '/site', search: '?page=%2Fpage-1%2Fcontact' })).toBe('/page-1/contact');
        expect(dockingURLTarget(query, { pathname: '/site', search: 'a=1&page=/p' })).toBe('/p');
        expect(dockingURLTarget(query, { pathname: '/site', search: '?other=1' })).toBeNull();
        expect(dockingURLTarget(query, { pathname: '/site', search: '' })).toBeNull();
        expect(dockingURLTarget({ ...query, base: '/docs' }, { pathname: '/x', search: '?page=/p' })).toBe('/p');
    });

    it('survives what an address bar can carry: a malformed escape, a plus, a repeated parameter, an encoded pathname', () => {
        expect(() => dockingURLTarget(query, { pathname: '/site', search: '?page=%E0%A4%A' })).not.toThrow();
        expect(dockingURLTarget(query, { pathname: '/site', search: '?page=/a+b' })).toBe('/a b');
        expect(dockingURLTarget(query, { pathname: '/site', search: '?page=/first&page=/second' })).toBe('/first');
        expect(dockingURLTarget(path, { pathname: '/page%201/', search: '' })).toBe('/page 1');
        expect(dockingURLTarget(path, { pathname: '/%E0%A4%A', search: '' })).toBe('/%E0%A4%A');
        expect(dockingURLTarget(path, { pathname: '/page-1///', search: '' })).toBe('/page-1');
    });
});
