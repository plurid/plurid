// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
    } from 'react';

    import {
        SpaceTransform,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        readViewpointFromURL,
        writeViewpointToURL,
    } from '~services/logic/viewpoint';
    // #endregion external
// #endregion imports



// #region module
export interface UseViewpointURLParameters {
    stateTransform: SpaceTransform;
    /** `setSpaceLocation` — sets the 6 scalars AND recomputes the rendered matrix. */
    dispatchSetSpaceLocation: (payload: SpaceTransform) => void;
    /** `configuration.space.viewpointURLWrite` — reflect the camera into the URL. Default off. */
    write: boolean;
    /** `configuration.space.viewpointURLRestore` — restore the camera from the URL on load. Default off. */
    restore: boolean;
    /** `configuration.space.viewpointURLParam` — the query-param name. Default `v`. */
    param: string;
    /** Debounce (ms) before reflecting a changed transform into the URL. Default 400. */
    debounce?: number;
}


/**
 * Optionally bind the camera viewpoint and the URL's `?<param>=` — both directions are OPT-IN and
 * INDEPENDENT, and the engine touches the URL ONLY when asked:
 * - `restore`: ON MOUNT, if the URL carries a viewpoint, restore it (instant — a deep-link overrides
 *   any persisted camera).
 * - `write`: ON TRANSFORM CHANGE, reflect it back via debounced `replaceState` (preserves path/query/
 *   hash, no history spam).
 *
 * Default config has BOTH off → no URL pollution. The first write is skipped so the pre-restore
 * default transform never clobbers the `?<param>=` the user arrived with.
 */
export const useViewpointURL = (
    {
        stateTransform,
        dispatchSetSpaceLocation,
        write,
        restore,
        param,
        debounce = 400,
    }: UseViewpointURLParameters,
) => {
    // #region restore once on mount
    const restored = useRef(false);
    useEffect(() => {
        if (!restore || restored.current) {
            return;
        }
        restored.current = true;

        const viewpoint = readViewpointFromURL(param);
        if (viewpoint) {
            dispatchSetSpaceLocation(viewpoint);
        }
    }, [restore, param]);
    // #endregion restore once on mount


    // #region reflect transform → URL
    const writeTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const skipFirstWrite = useRef(true);
    useEffect(() => {
        if (!write) {
            return;
        }
        // Don't write on the first run — let the restore above apply first, so we never overwrite
        // the incoming `?<param>=` with the default transform.
        if (skipFirstWrite.current) {
            skipFirstWrite.current = false;
            return;
        }

        if (writeTimeout.current) {
            clearTimeout(writeTimeout.current);
        }
        writeTimeout.current = setTimeout(() => {
            writeViewpointToURL(stateTransform, param);
        }, debounce);

        return () => {
            if (writeTimeout.current) {
                clearTimeout(writeTimeout.current);
            }
        };
    }, [write, param, stateTransform, debounce]);
    // #endregion reflect transform → URL
}
// #endregion module



// #region exports
export default useViewpointURL;
// #endregion exports
