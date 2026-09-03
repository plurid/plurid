// #region imports
    // #region libraries
    import {
        defaultConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import reducer, {
        SET_STATE,
    } from '../reducer';

    import {
        actions,
    } from '~services/state/modules/space';
    // #endregion external
// #endregion imports



// #region module
describe('SET_STATE (props recompute)', () => {
    it('replaces the host-owned slices and keeps the live space, taking only the view and limits', () => {
        let state = reducer(undefined, { type: '@@init' });
        state = reducer(state, actions.applyCameraDelta({ yaw: 30 }));
        state = reducer(state, actions.setSelection(['x']));
        const before = state;

        const configuration = {
            ...defaultConfiguration,
            space: { ...defaultConfiguration.space, layout: { type: 'ROWS' } as any },
        };
        const next = reducer(state, {
            type: SET_STATE,
            payload: {
                configuration,
                space: {
                    ...state.space,
                    view: ['/a', '/b'],
                    camera: { ...state.space.camera, yaw: 0 },
                    selectedPlaneIDs: [],
                    cameraLimits: { ...state.space.cameraLimits, pitchLimit: 45 },
                },
            },
        });

        expect(next.configuration).toBe(configuration);
        expect(next.space.camera.yaw).toBe(30);
        expect(next.space.selectedPlaneIDs).toEqual(['x']);
        expect(next.space.view).toEqual(['/a', '/b']);
        expect(next.space.cameraLimits.pitchLimit).toBe(45);
        expect(next.themes).toBe(before.themes);
        expect(next.space.tree).toBe(before.space.tree);
    });

    it('is a no-op when nothing the props own changed', () => {
        const state = reducer(undefined, { type: '@@init' });
        const next = reducer(state, {
            type: SET_STATE,
            payload: { configuration: state.configuration, space: state.space },
        });
        expect(next).toBe(state);
    });
});
// #endregion module
