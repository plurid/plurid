// #region imports
import {
    useRef,
    useEffect,
} from 'react';
// #endregion imports



// #region module
/**
 * Source: https://stackoverflow.com/a/57335271
 *
 * @param callback Function to be called.
 * @param wait Debounce time.
 */
function useDebouncedCallback<A extends any[]>(
    callback: (...args: A) => void,
    wait: number,
) {
    // track args & timeout handle between calls
    const argsRef = useRef<A>();
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    function cleanup() {
        if(timeout.current) {
            clearTimeout(timeout.current);
        }
    }

    // make sure our timeout gets cleared if
    // our consuming component gets unmounted
    useEffect(() => cleanup, []);

    return function debouncedCallback(
        ...args: A
    ) {
        // capture latest args
        argsRef.current = args;

        // clear debounce timer
        cleanup();

        // start waiting again
        timeout.current = setTimeout(() => {
            if(argsRef.current) {
                callback(...argsRef.current);
            }
        }, wait);
    };
}
// #endregion module



// #region exports
export default useDebouncedCallback;
// #endregion exports
