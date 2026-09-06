/**
 * @jest-environment jsdom
 */
import {
    readDockingURLTarget,
    readDockingURLState,
    writeDockingURL,
    findTreePlaneByPath,
    parentPath,
} from '../url';



const path = { write: true, restore: true, history: 'push' as const, mode: 'path' as const, param: 'page' };
const query = { ...path, mode: 'query' as const, history: 'replace' as const };

describe('the docking URL primitives', () => {
    beforeEach(() => {
        window.history.replaceState(null, '', '/');
    });

    it('reads the page path from the pathname, or from the query parameter in the query mode', () => {
        window.history.replaceState(null, '', '/page-1/about/?fixture=x#h');
        expect(readDockingURLTarget(path)).toBe('/page-1/about');
        expect(readDockingURLTarget(query)).toBeNull();
        window.history.replaceState(null, '', '/site?page=%2Fpage-1%2Fcontact');
        expect(readDockingURLTarget(query)).toBe('/page-1/contact');
        expect(readDockingURLTarget(path)).toBe('/site');
        window.history.replaceState(null, '', '/');
        expect(readDockingURLTarget(path)).toBe('/');
    });

    it('writes the pathname and keeps the query and the hash; the entry records the page; push adds an entry, replace does not', () => {
        window.history.replaceState({ host: 1 }, '', '/?fixture=page-docked#top');
        const length = window.history.length;
        writeDockingURL(path, '/page-1', 'plurid://localhost/page-1@0', { replace: true });
        expect(window.location.pathname).toBe('/page-1');
        expect(window.location.search).toBe('?fixture=page-docked');
        expect(window.location.hash).toBe('#top');
        expect(window.history.length).toBe(length);
        expect(readDockingURLState(window.history.state)).toEqual({ docked: 'plurid://localhost/page-1@0', path: '/page-1' });
        expect((window.history.state as any).host).toBe(1);
        writeDockingURL(path, '/page-1/about', 'plurid://localhost/page-1/about@1', { replace: false });
        expect(window.location.pathname).toBe('/page-1/about');
        expect(window.history.length).toBe(length + 1);
    });

    it('the query mode leaves the pathname to the host', () => {
        window.history.replaceState(null, '', '/route/x?a=1');
        writeDockingURL(query, '/page-1/about', 'id', { replace: true });
        expect(window.location.pathname).toBe('/route/x');
        expect(new URLSearchParams(window.location.search).get('page')).toBe('/page-1/about');
        expect(new URLSearchParams(window.location.search).get('a')).toBe('1');
    });

    it('finds a tree plane by its path, shown first; the parent path walks up', () => {
        const node = (route: string, show = true, children: any[] = []) => ({ planeID: route + '@0', route, show, children } as any);
        const tree = [node('plurid://localhost/site', true, [node('plurid://localhost/site/about', false), node('plurid://localhost/site/about', true)])];
        expect(findTreePlaneByPath(tree, '/site')?.planeID).toBe('plurid://localhost/site@0');
        expect(findTreePlaneByPath(tree, '/site/about')?.show).toBe(true);
        expect(findTreePlaneByPath(tree, '/nope')).toBeUndefined();
        expect(parentPath('/page-1/about')).toBe('/page-1');
        expect(parentPath('/page-1')).toBeNull();
        expect(parentPath('/')).toBeNull();
    });
});
