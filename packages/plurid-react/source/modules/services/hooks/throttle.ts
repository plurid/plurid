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

        // // capture latest args

        // // clear debounce timer
        // cleanup();

        // // start waiting again
        // timeout.current = setTimeout(() => {
        //     if(argsRef.current) {
        //         callback(...argsRef.current);
        //     }
        // }, wait);
    };
}


// const useThrottledCallback = (
//     callback: any,
//     delay: number,
//     dependencies: any[] = [],
// ) => {
//     const lastRan = useRef(Date.now());

//     const timeout = useRef<ReturnType<typeof setTimeout>>();


//     useEffect(
//         () => {
//             const handler = setTimeout(
//                 () => {
//                     if (Date.now() - lastRan.current >= delay) {
//                         callback();
//                         lastRan.current = Date.now();
//                     }
//                 },
//                 delay - (Date.now() - lastRan.current)
//             );

//             return () => {
//                 clearTimeout(handler);
//             };
//         },
//         [
//             delay,
//             ...dependencies,
//         ],
//     );
// };


export default useThrottledCallback;
