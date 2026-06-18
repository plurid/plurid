// #region imports
    // #region libraries
    import React, {
        useRef,
        useState,
        useEffect,
    } from 'react';
    // #endregion libraries
// #region imports



// #region module
/**
 * After a `true` dispatch, it will wait the `intervalTime` and autoset to `false`.
 *
 * @param intervalTime
 * @returns
 */
const useFalseAfterTimedTrue = (
    intervalTime = 2_000, // ms
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] => {
    // #region references
    const mounted = useMounted();
    // #endregion references

    // #region state
    const [
        disabledAfterActivation,
        setDisabledAfterActivation,
    ] = useState(false);
    // #endregion state

    // #region effects
    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;

        if (disabledAfterActivation) {
            timeout = setTimeout(() => {
                if (!mounted) {
                    return;
                }

                setDisabledAfterActivation(false);
            }, intervalTime);
        }

        return () => {
            if (timeout) {
                clearTimeout(timeout);
                timeout = undefined;
            }
        }
    }, [
        disabledAfterActivation,
    ]);
    // #endregion effects

    // #region return
    return [
        disabledAfterActivation,
        setDisabledAfterActivation,
    ];
    // #endregion return
}


/**
 * Keeps reference of the current mounted component.
 *
 * @returns
 */
const useMounted = () => {
    // #region references
    const isMounted = useRef(false);
    // #endregion references

    // #region effects
    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        }
    }, []);
    // #endregion effects

    // #region return
    return isMounted.current;
    // #endregion return
}
// #endregion module



// #region exports
export {
    useFalseAfterTimedTrue,
    useMounted,
};
// #endregion exports
