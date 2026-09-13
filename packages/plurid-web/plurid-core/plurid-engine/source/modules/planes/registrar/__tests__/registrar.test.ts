// #region imports
    // #region external
    import {
        Registrar,
    } from '../index';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE REGISTRAR: the one authority on "is this route a plane HERE?". Every application owns one, and
 * a paste from another space now asks it before it can hold what it was given
 * (`materializeFragment`), so what it answers decides whether a plane lands or is dropped by name. It
 * had no test of its own (2026-09-13).
 */
const component = () => null;

const registrar = (
    routes: string[],
    origin = 'origin',
    fallback?: Registrar<unknown> | (() => Registrar<unknown> | undefined),
) => new Registrar<unknown>(
    routes.map((route) => ({ route, component })),
    origin,
    fallback as never,
);


describe('the planes registrar', () => {
    it('answers for a route it registers, and not for one it does not', () => {
        const planes = registrar(['/a', '/b/c']);

        expect(planes.get('/a')).toBeTruthy();
        expect(planes.get('/b/c')).toBeTruthy();
        expect(planes.get('/nowhere')).toBeUndefined();
        expect(planes.get('')).toBeUndefined();
    });

    it('what comes back carries the route it resolved to, and the component to render', () => {
        const registered = registrar(['/a']).get('/a')!;

        expect(registered.component).toBe(component);
        expect(registered.route.absolute).toContain('/a');
        expect(registered.route.query).toEqual({});
    });

    it('THE QUERY TRAVELS: a route with a query resolves, and the query comes back with it', () => {
        const registered = registrar(['/a']).get('/a?x=1&y=two')!;

        expect(registered).toBeTruthy();
        expect(registered.route.query).toEqual({ x: '1', y: 'two' });
    });

    it('a PARAMETRIC route matches its instances and hands back the parameters', () => {
        const planes = registrar(['/items/:id']);
        const registered = planes.get('/items/42')!;

        expect(registered).toBeTruthy();
        expect(registered.route.parameters).toEqual({ id: '42' });
        // a path of a different shape is not that plane
        expect(planes.get('/items')).toBeUndefined();
        expect(planes.get('/items/42/parts')).toBeUndefined();
    });

    it('`identify` lists what it holds; `getAll` hands back the index the tree is computed from', () => {
        const planes = registrar(['/a', '/b']);

        expect(planes.identify()).toHaveLength(2);
        const all = planes.getAll();
        expect(all.size).toBe(2);
        for (const [, registered] of all) {
            expect(registered.component).toBe(component);
        }
    });

    it('`register` adds planes to a live registrar', () => {
        const planes = registrar(['/a']);
        expect(planes.get('/late')).toBeUndefined();

        planes.register([{ route: '/late', component }]);
        expect(planes.get('/late')).toBeTruthy();
        expect(planes.identify()).toHaveLength(2);
    });

    it('THE FALLBACK IS READ-ONLY: a route it alone knows resolves, and an own registration WINS', () => {
        const global = registrar(['/shared', '/only-global']);
        const own = registrar(['/shared', '/only-own'], 'origin', global);

        // its own, the fallback's, and both
        expect(own.get('/only-own')).toBeTruthy();
        expect(own.get('/only-global')).toBeTruthy();
        expect(own.get('/shared')).toBeTruthy();

        // the fallback never learns about the registrar in front of it
        expect(global.get('/only-own')).toBeUndefined();

        // `getAll` merges, with the own registration on top — three routes, each named once
        expect(own.getAll().size).toBe(3);
        const paths = own.identify().map((route) => route.replace(/^plurid:\/\/[^/]+/, '')).sort();
        expect(paths).toEqual(['/only-global', '/only-own', '/shared']);
    });

    it('a LAZY fallback is resolved when asked, and a self-reference cannot loop', () => {
        const global = registrar(['/only-global']);
        const own = registrar(['/a'], 'origin', () => global);
        expect(own.get('/only-global')).toBeTruthy();

        // the application passes a getter that can return the registrar itself: it must not recurse
        const solitary: Registrar<unknown> = new Registrar<unknown>(
            [{ route: '/a', component }],
            'origin',
            (() => solitary) as never,
        );
        expect(solitary.get('/a')).toBeTruthy();
        expect(solitary.get('/nowhere')).toBeUndefined();
    });

    it('an empty registrar answers nothing rather than throwing', () => {
        const empty = new Registrar<unknown>();
        expect(empty.get('/a')).toBeUndefined();
        expect(empty.identify()).toEqual([]);
        expect(empty.getAll().size).toBe(0);
    });
});
// #endregion module
