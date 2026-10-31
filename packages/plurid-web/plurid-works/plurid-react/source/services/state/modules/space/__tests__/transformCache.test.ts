import { getTransform } from '../selectors';
import { reducer } from '../index';
import type { AppState } from '../../../store';

it('keeps stable transform results without retaining every previous camera position', () => {
    const space = reducer(undefined, { type: '@@init' });
    const state = { space } as AppState;
    getTransform.clearCache();
    getTransform.memoizedResultFunc.clearCache();
    const first = getTransform(state);
    expect(getTransform({ ...state })).toBe(first);
    for (let index = 1; index <= 100; index++) {
        getTransform({ ...state, space: { ...space, camera: { ...space.camera, scale: space.camera.scale + index } } });
    }
    const revisited = getTransform({ ...state });
    expect(revisited).toEqual(first);
    expect(revisited).not.toBe(first);
    expect(getTransform(state)).toBe(revisited);
});
