// #region imports
    // #region libraries
    import {
        CameraState,
        PluridNamedViewpoint,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { AppState } from '~services/state/store';

    import {
        cameraCommand,
        decodeTarget,
        homeTarget,
        CameraThunk,
        CameraMotionOptions,
    } from '~services/logic/camera';
    // #endregion external
// #endregion imports



// #region module
/**
 * THE NAMED VIEWPOINTS. A saved camera reaches the space from three places — the runtime bookmarks
 * the reader saves (`space.bookmarks`, persisted), the presets the host configures
 * (`space.navigation.presets`, read-only) and the one home viewpoint — and every surface that lists
 * them (the Bookmarks drawer, the command palette, a host's own menu) reads THIS list instead of
 * walking three records with three vocabularies. The entries are derived, never stored: each one
 * carries its encoded string and the camera decoded against the LIVE view, so a thumbnail, a
 * distance or a "does it still point at anything" check needs no second lookup.
 *
 * `goViewpoint(entry)` is the one way to travel to one: the command it dispatches is the same one
 * the key press and the topic dispatch, so a row can never drift from the shortcut.
 */
const HOME_LABEL = 'Home';


const cameraOf = (
    state: AppState,
    encoded: string | undefined,
): CameraState | null => decodeTarget(state.space, encoded) ?? null;


/**
 * The home viewpoint — ALWAYS a row: when nothing was ever saved, `viewpoint` is `''` and the
 * camera is where `home` would take you anyway (the configured home, else the identity camera), so
 * the UI can show home without a special case.
 */
export const homeViewpoint = (
    state: AppState,
): PluridNamedViewpoint => ({
    id: 'home',
    source: 'home',
    name: '',
    label: HOME_LABEL,
    viewpoint: state.space.home || '',
    camera: homeTarget(state.space, state.configuration),
    editable: false,
});


/** The reader's own bookmarks, in the order they were saved (a rename keeps its place). */
export const bookmarkViewpoints = (
    state: AppState,
): PluridNamedViewpoint[] => Object.entries(state.space.bookmarks ?? {}).map(([name, viewpoint]) => ({
    id: 'bookmark:' + name,
    source: 'bookmark',
    name,
    label: name,
    viewpoint,
    camera: cameraOf(state, viewpoint),
    editable: true,
}));


/** The host's configured presets: named views of the same space, which the reader cannot edit. */
export const presetViewpoints = (
    state: AppState,
): PluridNamedViewpoint[] => Object.entries(state.configuration.space.navigation?.presets ?? {}).map(([name, viewpoint]) => ({
    id: 'preset:' + name,
    source: 'preset',
    name,
    label: name,
    viewpoint,
    camera: cameraOf(state, viewpoint),
    editable: false,
}));


/** Every named viewpoint the space knows: home, then the bookmarks, then the presets. */
export const namedViewpoints = (
    state: AppState,
): PluridNamedViewpoint[] => [
    homeViewpoint(state),
    ...bookmarkViewpoints(state),
    ...presetViewpoints(state),
];


/** Travel to a named viewpoint — the command its own kind names, tweening by default. */
export const goViewpoint = (
    entry: Pick<PluridNamedViewpoint, 'source' | 'name'>,
    options: CameraMotionOptions = {},
): CameraThunk => {
    const motion = { animate: true, ...options };

    switch (entry.source) {
        case 'home':
            return cameraCommand({ kind: 'home' }, motion);
        case 'preset':
            return cameraCommand({ kind: 'preset', name: entry.name }, motion);
        default:
            return cameraCommand({ kind: 'bookmark', name: entry.name, action: 'go' }, motion);
    }
};
// #endregion module
