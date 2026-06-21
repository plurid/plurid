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

        if (mouseOver && hoverOutTimeout.current) {
            hoverInTimeout.current = setTimeout(
                () => {
                    setShowPreview(true);
                },
                appearTime,
            );

            clearTimeout(hoverOutTimeout.current);
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
