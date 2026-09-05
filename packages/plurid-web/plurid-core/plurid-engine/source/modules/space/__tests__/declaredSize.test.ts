// #region imports
    // #region libraries
    import {
        defaultConfiguration,
        defaultTreePlane,
        TreePlane,
    } from '@plurid/plurid-data';
    // #endregion libraries

    // #region external
    import {
        Registrar,
    } from '../../planes/registrar';
    import {
        logic,
        fields,
    } from '../tree';
    // #endregion external
// #endregion imports



// #region module
const component = () => null;

describe('declared plane sizes', () => {
    const registrar = new Registrar<any>([
        { route: '/sized', component, width: 480, height: 300 },
        ['/wide', component, { width: 200 }],
        { route: '/plain', component },
    ]);

    it('registration carries width / height in both forms, next to head', () => {
        expect(registrar.get('/sized')).toMatchObject({ width: 480, height: 300 });
        expect(registrar.get('/wide')).toMatchObject({ width: 200 });
        expect(registrar.get('/wide')!.height).toBeUndefined();
        expect(registrar.get('/plain')!.width).toBeUndefined();
        const all = [...registrar.getAll().values()];
        expect(all.find((plane) => plane.route.absolute === '/sized')).toMatchObject({ width: 480, height: 300 });
    });

    it('the tree node is born with the declared size and sizeMode declared; an undeclared dimension stays 0', () => {
        const planes = registrar.getAll();
        const sized = logic.resolveViewItem(planes, '/sized', defaultConfiguration, 'origin', () => 0)!;
        expect(sized).toMatchObject({ width: 480, height: 300, sizeMode: 'declared' });
        const wide = logic.resolveViewItem(planes, '/wide', defaultConfiguration, 'origin', () => 0)!;
        expect(wide).toMatchObject({ width: 200, height: 0, sizeMode: 'declared' });
        const plain = logic.resolveViewItem(planes, '/plain', defaultConfiguration, 'origin', () => 0)!;
        expect(plain.width).toBe(0);
        expect(plain.height).toBe(0);
        expect(plain.sizeMode).toBeUndefined();
    });

    it('a spawned child gets its declaration too (placed by it, not by the fallback width)', () => {
        const root: TreePlane = { ...defaultTreePlane, sourceID: '/plain', planeID: 'root', route: '/plain', show: true, width: 400, height: 300 };
        const { updatedTreePlane } = logic.updateTreeWithNewPlane('/sized', 'root', { x: 100, y: 40 }, [root], registrar.getAll(), defaultConfiguration, 'origin', { linkID: 'l', fallbackWidth: 999 });
        expect(updatedTreePlane).toMatchObject({ width: 480, height: 300, sizeMode: 'declared' });
    });

    it('reconcile keeps a declared node by reference and never drops a changed sizeMode', () => {
        const node = (sizeMode?: TreePlane['sizeMode']): TreePlane => ({
            ...defaultTreePlane, sourceID: 'a', planeID: 'a', route: '/a', show: true, width: 480, height: 300, ...(sizeMode ? { sizeMode } : {}),
        });
        const previous = [node('declared')];
        expect(logic.reconcileTree(previous, [node('declared')])).toBe(previous);
        const changed = logic.reconcileTree(previous, [node('manual')]);
        expect(changed).not.toBe(previous);
        expect(changed[0].sizeMode).toBe('manual');
    });

    it('a hidden declared plane keeps its size across a view resize', () => {
        const hidden: TreePlane = { ...defaultTreePlane, sourceID: 'a', planeID: 'a', route: '/a', show: false, width: 480, height: 300, sizeMode: 'declared' };
        const measured: TreePlane = { ...defaultTreePlane, sourceID: 'b', planeID: 'b', route: '/b', show: false, width: 600, height: 300 };
        const next = fields.refreshHiddenPlaneSizes([hidden, measured], { width: 320, height: 224 });
        expect(next[0]).toBe(hidden);
        expect(next[1].width).toBe(320);
    });
});
// #endregion module
