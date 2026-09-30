// #region imports
    // #region libraries
    import {
        LAYOUT_TYPES,
        PluridConfiguration,
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        Registrar,
    } from '../../../planes/registrar';
    import Tree from '../object';
    import {
        resolveLayoutType,
    } from '../../layout';
    // #endregion external
// #endregion imports



// #region module
/**
 * A LAYOUT TYPE THE ENGINE DOES NOT LAY OUT NEVER EMPTIES THE SPACE (audit 2026-09-29 #1). META —
 * offered by the toolbar — a JS host's `'columns'` and a typo returned no roots at all, and
 * `setTree([])` emptied the space (switching back rebuilt bare roots: children and pins gone).
 */
const component = () => null;
const view = { width: 1440, height: 840 };

const configurationWith = (
    layout: Record<string, unknown>,
): PluridConfiguration => ({
    ...defaultConfiguration,
    space: {
        ...defaultConfiguration.space,
        layout: layout as any,
    },
});

const compute = (
    layout: Record<string, unknown>,
) => new Tree<any>({
    planes: new Registrar<any>([
        { route: '/a', component },
        { route: '/b', component },
        { route: '/c', component },
    ], 'host').getAll(),
    view: ['/a', '/b', '/c'],
    configuration: configurationWith(layout),
    layout: true,
    viewSize: view,
}, 'host').compute();

const placements = (
    layout: Record<string, unknown>,
) => compute(layout).map((root) => [root.location.translateX, root.location.translateY]);


describe('the layout type', () => {
    let warn: jest.SpyInstance;
    beforeEach(() => {
        warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => {
        warn.mockRestore();
    });

    it('META (typed, never implemented) lays every root out as COLUMNS, with a warning', () => {
        const roots = compute({ type: LAYOUT_TYPES.META, layouts: [] });
        expect(roots.length).toBe(3);
        expect(placements({ type: LAYOUT_TYPES.META, layouts: [] })).toEqual(placements({ type: LAYOUT_TYPES.COLUMNS }));
        expect(warn.mock.calls.some(([message]) => /META\) is not implemented/.test(message))).toBe(true);
    });

    it('an unknown or missing type is COLUMNS; a lowercase name is its member', () => {
        expect(compute({ type: 'GRID' }).length).toBe(3);
        expect(compute({}).length).toBe(3);
        expect(compute({ type: undefined }).length).toBe(3);
        expect(placements({ type: 'GRID', columns: 2 })).toEqual(placements({ type: LAYOUT_TYPES.COLUMNS, columns: 2 }));
        // `'rows'` is ROWS, not COLUMNS: a name that reads as one member is that member
        expect(placements({ type: 'rows', rows: 1 })).toEqual(placements({ type: LAYOUT_TYPES.ROWS, rows: 1 }));
        expect(placements({ type: 'face to face' })).toEqual(placements({ type: LAYOUT_TYPES.FACE_TO_FACE }));
    });

    it('resolves a type by its letters; warns once per type', () => {
        expect(resolveLayoutType(LAYOUT_TYPES.SHEAVES)).toEqual({ type: LAYOUT_TYPES.SHEAVES });
        expect(resolveLayoutType('columns').type).toBe(LAYOUT_TYPES.COLUMNS);
        expect(resolveLayoutType('face-to-face').type).toBe(LAYOUT_TYPES.FACE_TO_FACE);
        expect(resolveLayoutType('zigzag').type).toBe(LAYOUT_TYPES.ZIG_ZAG);
        expect(resolveLayoutType('zigzag').reason).toContain('LAYOUT_TYPES.ZIG_ZAG');
        expect(resolveLayoutType('meta')).toMatchObject({ type: LAYOUT_TYPES.COLUMNS });
        expect(resolveLayoutType(42)).toMatchObject({ type: LAYOUT_TYPES.COLUMNS });
        expect(resolveLayoutType(BigInt(1)).reason).toContain('bigint');
        expect(resolveLayoutType(null).reason).toContain('null');

        compute({ type: 'once-only' });
        compute({ type: 'once-only' });
        expect(warn.mock.calls.filter(([message]) => message.includes('once-only')).length).toBe(1);
    });

    it('a layout that fails lays the roots out in one column rather than taking the space down', () => {
        const throwing = {
            type: LAYOUT_TYPES.COLUMNS,
            get columns(): number {
                throw new Error('a getter a host wrote');
            },
        };
        const roots = compute(throwing);
        expect(roots.length).toBe(3);
        expect(roots.map((root) => root.location.translateX)).toEqual([0, 0, 0]);
        expect(warn.mock.calls.some(([message]) => /layout failed/.test(message))).toBe(true);
    });

    it('a development.warnings: false host hears nothing', () => {
        new Tree<any>({
            planes: new Registrar<any>([{ route: '/a', component }], 'host').getAll(),
            view: ['/a'],
            configuration: {
                ...configurationWith({ type: 'silenced' }),
                development: { ...defaultConfiguration.development, warnings: false },
            },
            layout: true,
            viewSize: view,
        }, 'host').compute();
        expect(warn.mock.calls.some(([message]) => message.includes('silenced'))).toBe(false);
    });
});
// #endregion module
