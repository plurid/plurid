// #region imports
    // #region libraries
    import {
        useMemo,
    } from 'react';

    import {
        PluridNamedViewpoint,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        cameraCommand,
        setHome as setHomeCommand,
        CameraMotionOptions,
    } from '~services/logic/camera';

    import {
        homeViewpoint,
        bookmarkViewpoints,
        presetViewpoints,
        goViewpoint,
    } from '~services/logic/viewpoints';

    import { AppState } from '~services/state/store';
    // #endregion external


    // #region internal
    import {
        useEngineSelector,
        useEngineDispatch,
        useEngineStore,
    } from '../engine';
    // #endregion internal
// #endregion imports



// #region module
export interface PluridBookmarksHandle {
    /** The reader's saved bookmarks, in the order they were saved. */
    bookmarks: PluridNamedViewpoint[];
    /** The host's configured presets (`space.navigation.presets`) — the same shape, read-only. */
    presets: PluridNamedViewpoint[];
    /** The home viewpoint: always present, its `viewpoint` empty until one is saved. */
    home: PluridNamedViewpoint;
    /** Save the current camera under `name`; an existing name is overwritten. */
    save: (name: string) => void;
    /** Travel to any named viewpoint — a bookmark, a preset or home. */
    go: (entry: Pick<PluridNamedViewpoint, 'source' | 'name'>, options?: CameraMotionOptions) => void;
    remove: (name: string) => void;
    /** Rename a bookmark, keeping its place in the list. */
    rename: (from: string, to: string) => void;
    /** Make `viewpoint` (or the current camera) the home viewpoint. */
    setHome: (viewpoint?: string) => void;
}


/**
 * THE NAMED VIEWPOINTS, as a hook: the bookmarks the reader saved, the presets the host configured
 * and the home viewpoint — one shape for the three — with the commands that edit and travel to
 * them. Every entry carries its decoded camera, so a host can draw its own thumbnail (the engine's
 * Bookmarks drawer draws the minimap's projection). Works anywhere under a `PluridApplication`.
 */
export const usePluridBookmarks = (): PluridBookmarksHandle => {
    const dispatch = useEngineDispatch();
    const store = useEngineStore();

    // The entries are DERIVED, and only from these: the two records, the home string and what the
    // decode reads (the view size, the perspective). Selecting them one by one — instead of the
    // whole state — is what keeps a camera frame from re-making the list sixty times a second.
    const saved = useEngineSelector((state: AppState) => state.space.bookmarks);
    const home = useEngineSelector((state: AppState) => state.space.home);
    const presets = useEngineSelector((state: AppState) => state.configuration.space.navigation?.presets);
    const viewSize = useEngineSelector((state: AppState) => state.space.viewSize);
    const perspective = useEngineSelector((state: AppState) => state.space.camera.perspective);

    const entries = useMemo(() => {
        const state = store.getState();
        return {
            home: homeViewpoint(state),
            bookmarks: bookmarkViewpoints(state),
            presets: presetViewpoints(state),
        };
    }, [saved, home, presets, viewSize, perspective, store]);

    const commands = useMemo(() => ({
        save: (name: string) => {
            dispatch(cameraCommand({ kind: 'bookmark', name, action: 'save' }) as any);
        },
        go: (
            entry: Pick<PluridNamedViewpoint, 'source' | 'name'>,
            options: CameraMotionOptions = {},
        ) => {
            dispatch(goViewpoint(entry, options) as any);
        },
        remove: (name: string) => {
            dispatch(cameraCommand({ kind: 'bookmark', name, action: 'remove' }) as any);
        },
        rename: (from: string, to: string) => {
            dispatch(cameraCommand({ kind: 'bookmark', name: from, action: 'rename', to }) as any);
        },
        setHome: (viewpoint?: string) => {
            dispatch(setHomeCommand(viewpoint) as any);
        },
    }), [dispatch]);

    return {
        ...entries,
        ...commands,
    };
};
// #endregion module
