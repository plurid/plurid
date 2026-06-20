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
    /** Debounce (ms) before reflecting a changed transform into the URL. Default 400. */
    debounce?: number;
}


/**
 * Two-way bind the camera viewpoint and the URL's `?v=`:
 * - ON MOUNT, if the URL carries a viewpoint, restore it (instant — overrides any persisted camera,
 *   so an explicit deep-link wins over the last-saved view).
 * - ON TRANSFORM CHANGE, reflect it back into the URL via debounced `replaceState` (see
 *   `writeViewpointToURL` — preserves path/query/hash, no history spam).
 *
 * The first write is skipped so the pre-restore default transform never clobbers the `?v=` the user
 * arrived with before the restore lands.
 */
export const useViewpointURL = (
    {
        stateTransform,
        dispatchSetSpaceLocation,
        debounce = 400,
    }: UseViewpointURLParameters,
) => {
    // #region restore once on mount
    const restored = useRef(false);
    useEffect(() => {
        if (restored.current) {
            return;
        }
        restored.current = true;

        const viewpoint = readViewpointFromURL();
        if (viewpoint) {
            dispatchSetSpaceLocation(viewpoint);
        }
    }, []);
    // #endregion restore once on mount


    // #region reflect transform → URL
    const writeTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const skipFirstWrite = useRef(true);
    useEffect(() => {
        // Don't write on the mount render — let the restore above apply first, so we never overwrite
        // the incoming `?v=` with the default transform.
        if (skipFirstWrite.current) {
            skipFirstWrite.current = false;
            return;
        }

        if (writeTimeout.current) {
            clearTimeout(writeTimeout.current);
        }
        writeTimeout.current = setTimeout(() => {
            writeViewpointToURL(stateTransform);
        }, debounce);

        return () => {
            if (writeTimeout.current) {
                clearTimeout(writeTimeout.current);
            }
        };
    }, [stateTransform, debounce]);
    // #endregion reflect transform → URL
}
// #endregion module



// #region exports
export default useViewpointURL;
// #endregion exports
