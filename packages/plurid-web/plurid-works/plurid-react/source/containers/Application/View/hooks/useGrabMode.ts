// #region imports
    // #region libraries
    import {
        useState,
        useRef,
        useEffect,
    } from 'react';
    // #endregion libraries
// #endregion imports



// #region module
/**
 * Grab/navigate mode (toggle with **G**, **Escape** exits). When OFF (default) the space behaves
 * like a normal page — text is selectable, content is clickable, the wheel scrolls. When ON a
 * left-drag orbits / pans the 3D space (a hand tool); middle-drag pans in any mode. The keydown is
 * ignored while typing in a field or with a modifier held.
 *
 * `grabModeRef` mirrors `grabMode` on every render so the pointer + wheel event handlers can read
 * the live value without re-binding their listeners.
 */
export const useGrabMode = () => {
    const [grabMode, setGrabMode] = useState(false);
    const grabModeRef = useRef(grabMode);
    grabModeRef.current = grabMode;

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            if (target && (
                target.tagName === 'INPUT'
                || target.tagName === 'TEXTAREA'
                || target.isContentEditable
            )) {
                return;
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return;
            }

            if (event.code === 'KeyG') {
                event.preventDefault();
                setGrabMode((value) => !value);
            } else if (event.code === 'Escape' && grabModeRef.current) {
                setGrabMode(false);
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return {
        grabMode,
        grabModeRef,
    };
}
// #endregion module



// #region exports
export default useGrabMode;
// #endregion exports
