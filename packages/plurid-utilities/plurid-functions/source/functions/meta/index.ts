// #region module
export const debounce = (
    func: any,
    wait: any,
    immediate: boolean = false,
) => {
    let timeout: any;

    return function (this: any) {
        let context = this;
        let args = arguments;

        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        let callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(context, args);
    };
};


/**
 * Source: https://stackoverflow.com/a/57335271
 *
 * @param callback Function to be called.
 * @param wait Debounce time.
 */
export function debouncedCallback<A extends any[]>(
    callback: (...args: A) => void,
    wait: number,
) {
    // track args & timeout handle between calls
    let argsRef: any;
    let timeout: any;

    function cleanup() {
        if (timeout) {
            clearTimeout(timeout);
        }
    }

    return function debouncedCallback(
        ...args: A
    ) {
        // capture latest args
        argsRef = args;

        // clear debounce timer
        cleanup();

        // start waiting again
        timeout = setTimeout(() => {
            if(argsRef) {
                callback(...argsRef);
            }
        }, wait);
    };
}
// #endregion module
