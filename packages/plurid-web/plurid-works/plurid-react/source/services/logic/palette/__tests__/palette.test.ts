// #region imports
    // #region external
    import {
        makeSpaceStore,
        treePlane,
        configurationWith,
    } from '../../../../testing';

    import actions from '~services/state/actions';

    import {
        paletteRows,
        scoreMatch,
        filterRows,
    } from '..';
    // #endregion external
// #endregion imports



// #region module
const store = (configuration = configurationWith({})) => makeSpaceStore(configuration, [
    treePlane('a', { route: 'plurid://origin/geometry' }),
    treePlane('b', { route: 'plurid://origin/topology', show: false }),
]);

const titles = (rows: { title: string }[]) => rows.map((row) => row.title);

describe('the command palette\'s rows', () => {
    it('lists the applicable commands with their keys, then the bookmarks and presets, then the shown planes', () => {
        const headless = store(configurationWith({ space: { navigation: { presets: { top: 'v2|0|0|1|0|0|0|0|0|0|2000' } } } }));
        headless.dispatch(actions.space.setBookmark({ name: 'wide', viewpoint: 'v2|0|0|1|0|0|0|0|0|0|2000' }));
        const rows = paletteRows(headless.getState());

        const fit = rows.find((row) => row.id === 'shortcut:fitToView')!;
        expect(fit).toBeTruthy();
        expect(fit.keys!.length).toBeGreaterThan(0);
        expect(fit.group).toBe('Navigate');
        // the palette's own row carries its chips
        expect(rows.find((row) => row.id === 'shortcut:palette')!.keys).toContain('K');

        expect(titles(rows)).toContain('Go to the bookmark wide');
        expect(titles(rows)).toContain('Go to the preset top');

        // the shown plane, by its path; the hidden one is not a destination
        expect(titles(rows)).toContain('Go to the plane /geometry');
        expect(titles(rows)).not.toContain('Go to the plane /topology');

        // the groups come in order: the commands, then the bookmarks, then the planes
        const groupsInOrder = rows.map((row) => row.group).filter((group, index, all) => group !== all[index - 1]);
        expect(groupsInOrder[groupsInOrder.length - 1]).toBe('Planes');
        expect(groupsInOrder[groupsInOrder.length - 2]).toBe('Bookmarks');
    });

    it('a disabled command is not a row; a row runs the SAME code its key press runs', () => {
        const headless = store(configurationWith({ space: { shortcuts: { disabled: ['fitToView'] } } }));
        const rows = paletteRows(headless.getState());
        expect(rows.find((row) => row.id === 'shortcut:fitToView')).toBeUndefined();

        const selectAll = paletteRows(store().getState()).find((row) => row.id === 'shortcut:selectAll')!;
        const running = store();
        selectAll.run({
            dispatch: running.dispatch as any,
            state: running.getState(),
            pubsub: { publish: () => {}, subscribe: () => 's', unsubscribe: () => true } as any,
        });
        expect(running.getState().space.selectedPlaneIDs).toEqual(['a']);
    });

    it('only what applies right now is a row (the `when` gate): the fly keys need first person', () => {
        const grounded = paletteRows(store().getState()).map((row) => row.id);
        expect(grounded).not.toContain('shortcut:flyForward');
        const flying = paletteRows(store(configurationWith({ space: { firstPerson: true } })).getState()).map((row) => row.id);
        expect(flying).toContain('shortcut:flyForward');
    });
});


describe('the palette\'s matching', () => {
    it('scores a subsequence, rewards an adjacent run and a word start, and misses what is absent', () => {
        expect(scoreMatch('', 'anything')).toBe(0);
        expect(scoreMatch('zz', 'fit to view')).toBe(-1);
        // a contiguous prefix beats scattered characters
        expect(scoreMatch('fit', 'Fit to view')).toBeGreaterThan(scoreMatch('fit', 'Refresh the it plane'));
        // a match at a word's start beats one inside a word
        expect(scoreMatch('v', 'Fit to view')).toBeGreaterThan(scoreMatch('v', 'Save the viewpoint'.replace('viewpoint', 'aviewpoint')));
    });

    it('filters and orders the rows, keeping the natural order on a tie, and returns everything for an empty query', () => {
        const rows = [
            { id: '1', title: 'Fit to view', group: 'g', run: () => {} },
            { id: '2', title: 'Frame the selection', group: 'g', run: () => {} },
            { id: '3', title: 'Go to the plane /geometry', group: 'g', run: () => {} },
        ];
        expect(filterRows(rows, '')).toBe(rows);
        expect(filterRows(rows, 'fit').map((row) => row.id)).toEqual(['1']);
        expect(filterRows(rows, 'geo').map((row) => row.id)).toEqual(['3']);
        expect(filterRows(rows, 'zzz')).toEqual([]);
        // both carry an `f` and an `e`: the earlier, tighter match leads
        expect(filterRows(rows, 'fe')[0].id).toBe('2');
    });
});
// #endregion module
