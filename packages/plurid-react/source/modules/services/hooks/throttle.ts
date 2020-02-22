import {
    useEffect,
    useRef,
} from 'react';



/**
 * @param callback
 * @param delay
 */
const useThrottledCallback = <A extends any[]>(
    callback: (...args: A) => void,
    delay: number,
) => {
    // track args & timeout handle between calls
    const lastRan = useRef(Date.now());
    const argsRef = useRef<A>();
    const timeout = useRef<ReturnType<typeof setTimeout>>();

    const cleanup = () => {
        if(timeout.current) {
            clearTimeout(timeout.current);
        }
    }

    useEffect(() => cleanup, []);

    return (
        ...args: A
    ) => {
        argsRef.current = args;

        timeout.current = setTimeout(
            () => {
                if (Date.now() - lastRan.current >= delay) {
                    if(argsRef.current) {
                        callback(...argsRef.current);
                    }
                    lastRan.current = Date.now();
                }
            },
            delay - (Date.now() - lastRan.current)
        );
    };
}


export default useThrottledCallback;
