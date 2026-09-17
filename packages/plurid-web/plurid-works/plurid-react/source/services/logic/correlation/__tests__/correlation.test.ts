import {
    planeIDsOf,
    planeOf,
    planeParameters,
    resolvePending,
    hiddenPlaneIDsOf,
    PENDING_TREE_CHANGES,
    PendingPlane,
} from '../index';



const plane = (
    planeID: string,
    values: Record<string, unknown> = {},
) => ({
    planeID,
    sourceID: planeID,
    route: 'plurid://localhost:5273' + planeID,
    routeDivisions: { path: { value: planeID, parameters: {}, query: {} } },
    ...values,
}) as any;

const request = (
    values: Partial<PendingPlane> = {},
): PendingPlane => ({
    token: 't',
    route: '',
    known: new Set<string>(),
    remaining: PENDING_TREE_CHANGES,
    ...values,
});


describe('reading a tree', () => {
    it('collects every plane id, children included', () => {
        const tree = [
            plane('/a', { children: [plane('/a/one'), plane('/a/two')] }),
            plane('/b'),
        ];

        expect([...planeIDsOf(tree)].sort()).toEqual(['/a', '/a/one', '/a/two', '/b']);
    });

    it('survives a tree with holes in it', () => {
        expect([...planeIDsOf([null, undefined, { children: null }] as any)]).toEqual([]);
        expect([...planeIDsOf(undefined as any)]).toEqual([]);
    });

    it('finds a plane at any depth, and answers undefined for one that is not there', () => {
        const tree = [plane('/a', { children: [plane('/a/deep', { children: [plane('/a/deeper')] })] })];

        expect(planeOf(tree, '/a/deeper')?.planeID).toBe('/a/deeper');
        expect(planeOf(tree, '/nowhere')).toBeUndefined();
    });
});


/**
 * THE REGEX EVERY PRODUCT WROTE.
 *
 * The engine parses a route's parameters to build the plane and then dropped
 * them from every observation, so a product declaring `/thread/:threadID` had
 * to parse `plurid://host/thread/<id>@2` back with a regex to recover the id it
 * had supplied in the first place.
 */
describe('a plane\'s parameters', () => {
    const tree = [
        plane('/thread/abc', {
            routeDivisions: { path: { value: '/thread/abc', parameters: { threadID: 'abc' }, query: {} } },
        }),
    ];

    it('come back parsed, in the host\'s own vocabulary', () => {
        expect(planeParameters(tree, '/thread/abc')).toEqual({ threadID: 'abc' });
    });

    it('are a copy, so a host cannot write into the tree through them', () => {
        const parameters = planeParameters(tree, '/thread/abc');
        parameters.threadID = 'changed';

        expect(planeParameters(tree, '/thread/abc')).toEqual({ threadID: 'abc' });
    });

    it('are empty for a plane that is not there, or one with no parameters', () => {
        expect(planeParameters(tree, '/nowhere')).toEqual({});
        expect(planeParameters([plane('/plain')], '/plain')).toEqual({});
    });
});


describe('answering which plane a command became', () => {
    it('answers with the plane that was not there before', () => {
        const pending = [request({ token: 'one', route: '/b' })];
        const tree = [plane('/a'), plane('/b')];

        const { observations, waiting } = resolvePending(pending, tree);

        expect(waiting).toEqual([]);
        expect(observations).toEqual([{
            token: 'one',
            planeID: '/b',
            route: 'plurid://localhost:5273/b',
            parameters: {},
            parentPlaneID: '',
        }]);
    });

    /**
     * The case the DOM workaround got WRONG: `querySelector` returns the first
     * match, so opening a route that is already open addressed the plane that
     * was already there.
     */
    it('answers with the NEW plane when the same route is already open', () => {
        // the engine numbers a repeat occurrence on the PLANE ID and leaves the
        // route alone (`planeID = route + '@' + count`), so two planes of one
        // route are told apart only by their ids — which is exactly what the
        // DOM workaround could not do: `querySelector` returned the first
        const route = 'plurid://localhost:5273/thread/a';
        const first = plane('/thread/a', { planeID: route, route });
        const second = plane('/thread/a', { planeID: route + '@2', route });

        const { observations } = resolvePending(
            [request({ token: 'again', route: '/thread/a', known: new Set([route]) })],
            [first, second],
        );

        expect(observations[0].planeID).toBe(route + '@2');
    });

    it('matches a relative route against the tree\'s absolute one', () => {
        const { observations } = resolvePending(
            [request({ route: '/library' })],
            [plane('/library')],
        );

        expect(observations[0].route).toBe('plurid://localhost:5273/library');
    });

    it('carries the parameters and the parent of a spawned child', () => {
        const tree = [plane('/a', {
            children: [plane('/thread/x', {
                parentPlaneID: '/a',
                routeDivisions: { path: { value: '/thread/x', parameters: { threadID: 'x' }, query: {} } },
            })],
        })];

        const { observations } = resolvePending(
            [request({ token: 'child', route: '/thread/x', known: new Set(['/a']) })],
            tree,
        );

        expect(observations[0]).toMatchObject({
            token: 'child',
            planeID: '/thread/x',
            parameters: { threadID: 'x' },
            parentPlaneID: '/a',
        });
    });

    it('keeps waiting while nothing new has appeared', () => {
        const { observations, waiting } = resolvePending(
            [request({ route: '/later', known: new Set(['/a']) })],
            [plane('/a')],
        );

        expect(observations).toEqual([]);
        expect(waiting).toHaveLength(1);
        expect(waiting[0].remaining).toBe(PENDING_TREE_CHANGES - 1);
    });

    it('and gives up rather than waiting forever for a route that never resolves', () => {
        let pending = [request({ route: '/never', known: new Set(['/a']) })];

        for (let pass = 0; pass < PENDING_TREE_CHANGES; pass += 1) {
            pending = resolvePending(pending, [plane('/a')]).waiting;
        }

        // a route matching no registered plane never arrives; a registry that
        // only ever grows is a leak
        expect(pending).toEqual([]);
    });

    it('ignores a new plane that is not the one asked for', () => {
        const { observations, waiting } = resolvePending(
            [request({ route: '/wanted', known: new Set(['/a']) })],
            [plane('/a'), plane('/unrelated')],
        );

        expect(observations).toEqual([]);
        expect(waiting).toHaveLength(1);
    });

    it('answers several requests from one tree, each with its own token', () => {
        const { observations } = resolvePending(
            [
                request({ token: 'first', route: '/b', known: new Set(['/a']) }),
                request({ token: 'second', route: '/c', known: new Set(['/a']) }),
            ],
            [plane('/a'), plane('/b'), plane('/c')],
        );

        expect(observations.map((entry) => [entry.token, entry.planeID]))
            .toEqual([['first', '/b'], ['second', '/c']]);
    });

    it('does no work at all when nothing is pending', () => {
        expect(resolvePending([], [plane('/a')])).toEqual({ observations: [], waiting: [] });
    });
});


/** exact routes, and a plane shown again: two answers the correlation did not give until 2026-09-16 */
describe('exactness, and a plane shown again', () => {
    it('does not answer /thread/1 with /other/thread/1', () => {
        const { observations } = resolvePending(
            [request({ token: 'k', route: '/thread/1', known: planeIDsOf([plane('/other')]) })],
            [plane('/other', { children: [plane('/other/thread/1')] }), plane('/thread/1')],
        );
        expect(observations.map((entry) => entry.planeID)).toEqual(['/thread/1']);
    });

    it('ignores a query or a fragment on the route asked for', () => {
        const { observations } = resolvePending(
            [request({ token: 'k', route: '/detail?mode=wire#top' })],
            [plane('/detail')],
        );
        expect(observations.map((entry) => entry.planeID)).toEqual(['/detail']);
    });

    it('answers with a plane that was put away and is shown again', () => {
        const before = [plane('/a', { children: [plane('/a/child', { show: false })] })];
        const after = [plane('/a', { children: [plane('/a/child', { show: true })] })];
        expect([...hiddenPlaneIDsOf(before)]).toEqual(['/a/child']);
        const { observations } = resolvePending(
            [request({ token: 'k', route: '/a/child', known: planeIDsOf(before), hidden: hiddenPlaneIDsOf(before) })],
            after,
        );
        expect(observations.map((entry) => entry.planeID)).toEqual(['/a/child']);
    });

    it('keeps waiting while a put-away plane stays put away', () => {
        const before = [plane('/a', { children: [plane('/a/child', { show: false })] })];
        const { observations, waiting } = resolvePending(
            [request({ token: 'k', route: '/a/child', known: planeIDsOf(before), hidden: hiddenPlaneIDsOf(before) })],
            before,
        );
        expect(observations).toEqual([]);
        expect(waiting).toHaveLength(1);
    });
});
