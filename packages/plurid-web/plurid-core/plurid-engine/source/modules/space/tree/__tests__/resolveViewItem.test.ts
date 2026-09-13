// #region imports
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';

    import {
        Registrar,
    } from '../../../planes/registrar';
    import {
        resolveViewItem,
    } from '../logic';
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
// #endregion module
