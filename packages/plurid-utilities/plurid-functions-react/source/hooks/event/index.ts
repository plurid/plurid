// #region imports
import {
    useEffect,
} from 'react';
// #endregion imports



// #region module
export const useWindowEvent = (
    event: any,
    callback: any,
) => {
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.addEventListener(event, callback, { passive: false });

        return () => {
            if (typeof window === 'undefined') {
                return;
            }

            window.removeEventListener(event, callback);
        }
    }, [
        event,
        callback,
    ]);
};


/**
 * Subscribe `callback` to `event` on `element`. An OMITTED element (`undefined`) means the window;
 * `null` means no subscription (a target not mounted yet). The target is resolved once per effect and
 * captured for the teardown, so a target that disappears or is replaced never throws on cleanup and
 * never keeps a stale listener (C14, 2026-09-06); a changed element re-subscribes.
 */
export const useElementEvent = (
    event: any,
    element: any,
    callback: any,
) => {
    useEffect(() => {
        const target = element === undefined
            ? (typeof window !== 'undefined' ? window : null)
            : element;
        if (!target || typeof target.addEventListener !== 'function') {
            return;
        }

        target.addEventListener(event, callback, { passive: false });

        return () => {
            target.removeEventListener(event, callback);
        };
    }, [
        event,
        element,
        callback,
    ]);
}


export const useGlobalKeyDown = (
    callback: any,
    element?: any,
) => {
    return useElementEvent(
        'keydown',
        element,
        callback,
    );
}


export const useGlobalWheel = (
    callback: any,
    element?: any,
) => {
    return useElementEvent(
        'wheel',
        element,
        callback,
    );
}
// #endregion module
