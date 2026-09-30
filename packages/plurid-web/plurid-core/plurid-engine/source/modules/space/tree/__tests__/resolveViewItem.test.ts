// #region imports
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        Registrar,
    } from '../../../planes/registrar';
    import {
        indexRegisteredPlanes,
        resolveViewItem,
        viewItemRoute,
    } from '../logic';
    import Tree from '../object';
    import {
        IsoMatcher,
    } from '../../../routing';
    import {
        checkPlaneAddressType,
        cleanPathValue,
        computePlaneAddress,
        isAbsolutePlane,
    } from '../../../routing/logic';
    import {
        extractFragments,
        extractPathname,
        extractQuery,
    } from '../../../routing/Parser/logic';
    // #endregion imports



// #region module
const component = () => null;
const planes = () => new Registrar<any>([
    { route: '/a', component },
    { route: '/items/:id', component },
]).getAll();

describe('resolveViewItem: the query travels', () => {
    it('keeps the requested route\'s query, fragment and parameters on the node; the address is the pathname\'s', () => {
        const node = resolveViewItem(planes(), '/a?x=1&y=two#:~:text=hello', defaultConfiguration, 'origin', () => 7)!;
        expect(node).toBeTruthy();
        // the address is the pathname's (the origin is the environment's host under jest)
        expect(node.route).toMatch(/^plurid:\/\/[^/]+\/a$/);
        expect(node.sourceID).toBe(node.route);
        expect(node.planeID).toBe(node.route + '@7');
        expect(node.routeDivisions.plane.query).toEqual({ x: '1', y: 'two' });
        expect(node.routeDivisions.plane.fragments.texts.length).toBe(1);
        expect(node.routeDivisions.plane.value).toBe(node.route);
        const bare = resolveViewItem(planes(), '/a', defaultConfiguration, 'origin', () => 8)!;
        expect(bare.routeDivisions.plane.query).toEqual({});
        expect(bare.routeDivisions.plane.fragments).toEqual({ elements: [], texts: [] });
    });

    it('a parametric plane carries its parameters and its query', () => {
        const node = resolveViewItem(planes(), '/items/42?sort=asc', defaultConfiguration, 'origin', () => 9)!;
        expect(node).toBeTruthy();
        expect(node.routeDivisions.plane.parameters).toEqual({ id: '42' });
        expect(node.routeDivisions.plane.query).toEqual({ sort: 'asc' });
        expect(node.route).toMatch(/\/items\/42$/);
    });
});


/**
 * A MALFORMED VIEW ITEM IS SKIPPED, NEVER THROWN (audit 2026-09-29 #6). `{ route }` (which the
 * `view.setPlanes` topic accepted), `null` or a number threw inside the tree compute; the next
 * relayout effect threw with it and the application unmounted. The typed `{ plane }` resolves.
 */
describe('resolveViewItem: a malformed view item', () => {
    it('names nothing, and resolves to nothing', () => {
        for (const item of [{ route: '/a' }, null, undefined, 42, {}, { plane: 7 }, ['/a']]) {
            expect(() => resolveViewItem(planes(), item as any, defaultConfiguration)).not.toThrow();
            expect(resolveViewItem(planes(), item as any, defaultConfiguration)).toBeUndefined();
            expect(viewItemRoute(item)).toBeUndefined();
        }
        expect(viewItemRoute('/a')).toBe('/a');
        expect(viewItemRoute({ plane: '/a', ordinal: 2 })).toBe('/a');
        expect(resolveViewItem(planes(), { plane: '/a' }, defaultConfiguration)?.route).toMatch(/\/a$/);
    });

    it('a tree compute skips it and keeps the roots it can resolve', () => {
        const tree = new Tree<any>({
            planes: planes(),
            view: [{ route: '/a' }, null, '/a', 42, { plane: '/items/1' }] as any,
            configuration: defaultConfiguration,
        }).compute();
        expect(tree.map((root) => root.route.replace(/^plurid:\/\/[^/]+/, ''))).toEqual(['/a', '/items/1']);
        expect(new Tree<any>({ planes: planes(), view: undefined as any, configuration: defaultConfiguration }).compute()).toEqual([]);
    });

    it('the address helpers it calls are total', () => {
        expect(computePlaneAddress(undefined as any)).toBe('');
        expect(checkPlaneAddressType(undefined as any)).toBe('relative');
        expect(cleanPathValue(null as any)).toBe('');
        expect(isAbsolutePlane(undefined as any)).toBe(false);
        expect(extractPathname(undefined as any)).toBe('');
        expect(extractQuery(42 as any)).toEqual({});
        expect(extractFragments(42 as any)).toEqual({ texts: [], elements: [] });
        const matcher = new IsoMatcher<any>({ planes: [{ route: '/a', component }, null as any, { route: undefined, component } as any] }, 'host');
        expect(matcher.match(undefined as any)).toBeUndefined();
        expect(matcher.match(null as any, 'route')).toBeUndefined();
        expect(matcher.match('/a')?.match.value).toBe('plurid://host/a');
        expect([...matcher.getPlanesIndex().keys()]).toEqual(['plurid://host/a']);
    });
});


/**
 * ONE INDEX PER COMPUTE (audit 2026-09-29 #12). The matcher was rebuilt over every registered plane
 * for every view item: a compute read the registered planes once per item.
 */
describe('a tree compute indexes the registered planes once', () => {
    it('reads them once, however many view items it resolves', () => {
        const registered = planes();
        let reads = 0;
        const counted = new Map(registered);
        const values = counted.values.bind(counted);
        counted.values = () => {
            reads += 1;
            return values();
        };
        const tree = new Tree<any>({
            planes: counted,
            view: ['/a', '/items/1', '/items/2', '/a', '/nowhere'],
            configuration: defaultConfiguration,
        }).compute();
        expect(tree.length).toBe(4);
        expect(reads).toBe(1);
        expect(indexRegisteredPlanes(registered).registeredByRoute.size).toBe(2);
    });
});
// #endregion module
