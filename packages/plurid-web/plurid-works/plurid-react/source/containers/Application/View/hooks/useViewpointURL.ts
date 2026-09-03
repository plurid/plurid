// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
    } from 'react';

    import {
        CameraState,
        CameraLimits,
        ViewSize,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import {
        readEncodedViewpointFromURL,
        decodeCameraViewpoint,
        encodeCameraViewpoint,
        writeViewpointToURL,
    } from '~services/logic/viewpoint';
    // #endregion external
// #endregion imports



// #region module
export interface UseViewpointURLParameters {
    stateCamera: CameraState;
    stateViewSize: ViewSize;
    stateCameraLimits: CameraLimits;
    /** `setCamera` — sets the camera AND recomputes the rendered matrix. */
    dispatchSetCamera: (camera: CameraState) => void;
    /** `configuration.space.viewpointURLWrite` — reflect the camera into the URL. Default off. */
    write: boolean;
    /** `configuration.space.viewpointURLRestore` — restore the camera from the URL on load. Default off. */
    restore: boolean;
    /** `configuration.space.viewpointURLParam` — the query-param name. Default `v`. */
    param: string;
    /** `configuration.space.viewpointURLVersion` — the encoding written. Default `1`. */
    version?: 1 | 2;
    /** Debounce (ms) before reflecting a changed camera into the URL. Default 400. */
    debounce?: number;
}


/**
 * Optionally bind the camera viewpoint and the URL's `?<param>=` — both directions are OPT-IN and
 * INDEPENDENT, and the engine touches the URL ONLY when asked:
 * - `restore`: ON MOUNT, if the URL carries a viewpoint (v1 or v2), restore it (instant — a
 *   deep-link overrides any persisted camera).
 * - `write`: ON CAMERA CHANGE, reflect it back via debounced `replaceState` (preserves path/query/
 *   hash, no history spam), in the configured encoding.
 *
 * Default config has BOTH off → no URL pollution. The first write is skipped so the pre-restore
 * default camera never clobbers the `?<param>=` the user arrived with.
 */
export const useViewpointURL = (
    {
        stateCamera,
        stateViewSize,
        stateCameraLimits,
        dispatchSetCamera,
        write,
        restore,
        param,
        version = 1,
        debounce = 400,
    }: UseViewpointURLParameters,
) => {
    // Always-latest values for the deferred writer / restorer without re-binding the effects.
    const latest = useRef({
        stateCamera,
        stateViewSize,
        stateCameraLimits,
    });
    latest.current = {
        stateCamera,
        stateViewSize,
        stateCameraLimits,
    };

    // #region restore once on mount
    const restored = useRef(false);
    useEffect(() => {
        if (!restore || restored.current) {
            return;
        }
        restored.current = true;

        const encoded = readEncodedViewpointFromURL(param);
        const camera = decodeCameraViewpoint(
            encoded,
            latest.current.stateViewSize,
            latest.current.stateCamera.perspective,
            latest.current.stateCameraLimits,
        );
        if (camera) {
            dispatchSetCamera(camera);
        }
    }, [restore, param]);
    // #endregion restore once on mount


    // #region reflect camera → URL
    const writeTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const skipFirstWrite = useRef(true);
    useEffect(() => {
        if (!write) {
            return;
        }
        // Don't write on the first run — let the restore above apply first, so we never overwrite
        // the incoming `?<param>=` with the default camera.
        if (skipFirstWrite.current) {
            skipFirstWrite.current = false;
            return;
        }

        if (writeTimeout.current) {
            clearTimeout(writeTimeout.current);
        }
        writeTimeout.current = setTimeout(() => {
            writeViewpointToURL(
                encodeCameraViewpoint(
                    latest.current.stateCamera,
                    latest.current.stateViewSize,
                    version,
                ),
                param,
            );
        }, debounce);

        return () => {
            if (writeTimeout.current) {
                clearTimeout(writeTimeout.current);
            }
        };
    }, [write, param, version, stateCamera, debounce]);
    // #endregion reflect camera → URL
}
// #endregion module



// #region exports
export default useViewpointURL;
// #endregion exports
