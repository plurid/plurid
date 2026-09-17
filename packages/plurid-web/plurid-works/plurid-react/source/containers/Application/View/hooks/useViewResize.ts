// #region imports
    // #region libraries
    import React, {
        useEffect,
    } from 'react';

    import {
        meta,
    } from '@plurid/plurid-functions';

    import {
        PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME,
    } from '@plurid/plurid-data';
    // #endregion libraries


    // #region external
    import { warnOnce } from '~services/logic/development/warn';
    // #endregion external
// #endregion imports



// #region module
export interface UseViewResizeParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    dispatchSpaceSetViewSize: (size: { width: number; height: number }) => void;
}


/**
 * View-size tracking: a `ResizeObserver` on the view element (plus the window `resize` fallback)
 * feeds a debounced measure → `setViewSize`, so the camera's pivot frame follows the CONTAINER —
 * a sidebar toggle or split-pane drag re-centers the orbit without a window resize. A host that
 * did not size the view (0 px) falls back to the window, the historical behavior. ONE window
 * listener, debounced: the relayout follows the VIEW SIZE's change (the View's layout effect), so
 * a second, undebounced listener that relaid the whole tree on every one of a drag's resize
 * events was a relayout for nothing.
 */
export const useViewResize = (
    {
        viewElement,
        dispatchSpaceSetViewSize,
    }: UseViewResizeParameters,
) => {
    /** Debounced view-size measurement. */
    useEffect(() => {
        const measure = () => {
            if (viewElement && viewElement.current) {
                if (viewElement.current.offsetWidth > 0 && viewElement.current.offsetHeight === 0) {
                    warnOnce(
                        'view-height-zero',
                        'the space\'s container has a width but no height — give the element that holds <PluridApplication> a height (e.g. `height: 100vh`), or the planes render into a 0 px view.',
                    );
                }
                const width = viewElement.current.offsetWidth || window.innerWidth;
                const height = viewElement.current.offsetHeight || window.innerHeight;
                dispatchSpaceSetViewSize({
                    width,
                    height,
                });
            }
        };
        const handleResize = meta.debounce(measure, PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME);

        measure();
        window.addEventListener('resize', handleResize);

        let observer: ResizeObserver | undefined;
        if (viewElement.current && typeof ResizeObserver !== 'undefined') {
            observer = new ResizeObserver(() => {
                handleResize();
            });
            observer.observe(viewElement.current);
        }

        return () => {
            window.removeEventListener('resize', handleResize);
            if (observer) {
                observer.disconnect();
            }
        }
    }, []);
}
// #endregion module



// #region exports
export default useViewResize;
// #endregion exports
