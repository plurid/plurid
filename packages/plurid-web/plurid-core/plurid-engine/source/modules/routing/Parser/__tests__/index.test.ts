// #region imports
    import {
        extractPathname,
        extractQuery,
        extractFragments,
    } from '../logic';
    // #region libraries
    import {
        PluridRoute,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import Parser from '../';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE PARSER: a location and a registered route become the pieces the space addresses a plane by —
 * the pathname, the parameters the route declares, the query, the text and element fragments, and the
 * route the address bar shows. Thirteen tests of this contract sat COMMENTED OUT (2026-09-13) beside
 * one live `it('works', () => {})`, so the class itself had no test at all; these assert what it does
 * now rather than the shape it had in 2021.
 */
const route = (
    value: string,
): PluridRoute<unknown> => ({ value } as PluridRoute<unknown>);

describe('Parser', () => {
    it('a simple route: the pathname, no parameters, no query, no fragments', () => {
        const parsed = new Parser('/one', route('/one')).extract();
        expect(parsed.pathname).toBe('/one');
        expect(parsed.match).toBe(true);
        expect(parsed.parameters).toStrictEqual({});
        expect(parsed.query).toStrictEqual({});
        expect(parsed.fragments).toStrictEqual({ texts: [], elements: [] });
        expect(parsed.route).toBe('/one');
        expect(parsed.path.value).toBe('/one');
    });

    it('a parametric route binds its parameters by name', () => {
        const parsed = new Parser('/two/42', route('/two/:id')).extract();
        expect(parsed.match).toBe(true);
        expect(parsed.parameters).toStrictEqual({ id: '42' });
        expect(parsed.pathname).toBe('/two/42');

        const two = new Parser('/items/7/parts/3', route('/items/:item/parts/:part')).extract();
        expect(two.parameters).toStrictEqual({ item: '7', part: '3' });
    });

    it('a location that does not match the route says so', () => {
        const parsed = new Parser('/elsewhere', route('/two/:id')).extract();
        expect(parsed.match).toBe(false);
        expect(parsed.parameters).toStrictEqual({});
    });

    it('the query is parsed and rebuilt into the route the address shows', () => {
        const parsed = new Parser('/three?id=1&show=true', route('/three')).extract();
        expect(parsed.query).toStrictEqual({ id: '1', show: 'true' });
        expect(parsed.pathname).toBe('/three');
        expect(parsed.route).toBe('/three?id=1&show=true');

        const empty = new Parser('/three?flag', route('/three')).extract();
        expect(empty.query).toStrictEqual({ flag: '' });
    });

    it('a text fragment is read; a malformed one is dropped rather than thrown', () => {
        const parsed = new Parser('/four#:~:text=A%20door,is%20opened.,[0]', route('/four')).extract();
        expect(parsed.fragments.texts.length).toBe(1);
        // AS WRITTEN, percent-escapes and all: nothing in the engine decodes a text fragment today,
        // so a consumer that matches it against the document must decode it itself. Pinned here so
        // the day that changes is a deliberate one.
        expect(parsed.fragments.texts[0].start).toBe('A%20door');
        expect(parsed.fragments.texts[0].end).toBe('is%20opened.');
        expect(parsed.fragments.texts[0].occurence).toBe(0);
        // the hash is not part of the pathname or the route
        expect(parsed.pathname).toBe('/four');
        expect(parsed.route).toBe('/four');

        const malformed = new Parser('/four#:~:text', route('/four')).extract();
        expect(malformed.fragments).toStrictEqual({ texts: [], elements: [] });
    });

    it('an element fragment is read the same way', () => {
        const parsed = new Parser('/five#:~:element=main', route('/five')).extract();
        expect(parsed.fragments.elements.length).toBeGreaterThan(0);
        expect(parsed.fragments.elements[0].type).toBe('element');
    });

    it('parameters, query and fragment TOGETHER, each kept apart from the others', () => {
        const parsed = new Parser('/six/9?sort=asc#:~:text=hello', route('/six/:id')).extract();
        expect(parsed.parameters).toStrictEqual({ id: '9' });
        expect(parsed.query).toStrictEqual({ sort: 'asc' });
        expect(parsed.fragments.texts.length).toBe(1);
        expect(parsed.pathname).toBe('/six/9');
        expect(parsed.route).toBe('/six/9?sort=asc');
    });

    it('`fragment: false` leaves the fragments unread', () => {
        const parsed = new Parser('/seven#:~:text=hello', route('/seven'), { fragment: false }).extract();
        expect(parsed.fragments).toStrictEqual({ texts: [], elements: [] });
    });

    describe('hashes and fragments (C06, 2026-09-06)', () => {
        it('an ordinary hash is neither pathname nor query', () => {
            expect(extractPathname('/a#details')).toBe('/a');
            expect(extractPathname('/a?x=1#details')).toBe('/a');
            expect(extractQuery('/a?x=1#details')).toStrictEqual({ x: '1' });
            expect(extractQuery('/a?x=1&y#details')).toStrictEqual({ x: '1', y: '' });
        });

        it('a malformed directive is dropped, never thrown', () => {
            expect(extractFragments('/a#:~:text')).toStrictEqual({ texts: [], elements: [] });
            expect(extractFragments('/a#:~:element=')).toStrictEqual({ texts: [], elements: [] });
            expect(extractFragments('/a#:~:=foo')).toStrictEqual({ texts: [], elements: [] });
            expect(extractFragments('/a#:~:text=foo,bar').texts).toStrictEqual([{ type: 'text', start: 'foo', end: 'bar', occurence: 0 }]);
        });
    });
});
// #endregion module
