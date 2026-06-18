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


export const useElementEvent = (
    event: any,
    element: any,
    callback: any,
) => {
    useEffect(() => {
        if (element) {
            element.addEventListener(event, callback, { passive: false });
        }
        return () => element.removeEventListener(event, callback);
    }, [event, callback]);
}

export const useGlobalKeyDown = (
    callback: any,
    element?: any,
) => {
    // if (!element) {
    //     return useWindowEvent('keydown', callback);
    // }

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
    // if (!element) {
    //     return useWindowEvent('wheel', callback);
    // }

    return useElementEvent(
        'wheel',
        element,
        callback,
    );
}
// #endregion module
