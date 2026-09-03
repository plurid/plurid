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
export interface UseLinkPreviewParameters {
    /** The link's preview config (truthy = previews enabled). */
    preview: unknown;
    mouseOver: boolean;
    appearTime: number;
    disappearTime: number;
}


/**
 * The hover-preview visibility state machine for a `PluridLink`: a debounced fade-in on hover-in and
 * fade-out on hover-out, driven by `mouseOver`. Owns its own timers + `showPreview` state. Returns
 * `setShowPreview` so the plane-lifecycle handlers (spawn/toggle) can force the preview hidden.
 */
export const useLinkPreview = (
    {
        preview,
        mouseOver,
        appearTime,
        disappearTime,
    }: UseLinkPreviewParameters,
) => {
    const hoverInTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const hoverOutTimeout = useRef<null | ReturnType<typeof setTimeout>>(null);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        if (!preview) {
            return;
        }

        if (mouseOver) {
            // Hover-in: cancel a pending fade-out and schedule the fade-in. (The previous guard
            // required a pending fade-out, so the preview never showed on the FIRST hover.)
            if (hoverOutTimeout.current) {
                clearTimeout(hoverOutTimeout.current);
                hoverOutTimeout.current = null;
            }
            hoverInTimeout.current = setTimeout(
                () => {
                    setShowPreview(true);
                },
                appearTime,
            );
        }
        if (!mouseOver) {
            hoverOutTimeout.current = setTimeout(
                () => {
                    setShowPreview(false);
                    if (hoverInTimeout.current) {
                        clearTimeout(hoverInTimeout.current);
                    }
                },
                disappearTime,
            );
        }

        return () => {
            if (hoverOutTimeout.current) {
                clearTimeout(hoverOutTimeout.current);
            }
            if (hoverInTimeout.current) {
                clearTimeout(hoverInTimeout.current);
            }
        }
    }, [
        preview,
        mouseOver,
    ]);

    return {
        showPreview,
        setShowPreview,
    };
}
// #endregion module



// #region exports
export default useLinkPreview;
// #endregion exports
