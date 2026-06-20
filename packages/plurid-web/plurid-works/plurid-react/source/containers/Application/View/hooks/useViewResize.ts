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
// #endregion imports



// #region module
export interface UseViewResizeParameters {
    viewElement: React.RefObject<HTMLDivElement>;
    dispatchSpaceSetViewSize: (size: { width: number; height: number }) => void;
    treeUpdateCallback: () => void;
}


/**
 * Window-resize handling for the View: a debounced measure → `setViewSize` (so the per-frame view
 * dimensions stay correct), plus a separate listener that recomputes the layout via
 * `treeUpdateCallback`. Two listeners on purpose — view-size is expensive to dispatch (debounced)
 * while the tree recompute is cheap (its own deps already gate it).
 */
export const useViewResize = (
    {
        viewElement,
        dispatchSpaceSetViewSize,
        treeUpdateCallback,
    }: UseViewResizeParameters,
) => {
    /** Debounced view-size measurement. */
    useEffect(() => {
        const handleResize = meta.debounce(() => {
            if (viewElement && viewElement.current) {
                const width = viewElement.current.offsetWidth;
                const height = viewElement.current.offsetHeight;
                dispatchSpaceSetViewSize({
                    width,
                    height,
                });
            }
        }, PLURID_DEFAULT_RESIZE_DEBOUNCE_TIME);

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        }
    }, []);

    /**
     * The effect only registers `treeUpdateCallback`, so depend on the callback itself — its own
     * deps already track view/config/tree. This drops two per-render whole-tree/whole-config
     * `JSON.stringify`s that recomputed the exact same trigger.
     */
    useEffect(() => {
        window.addEventListener('resize', treeUpdateCallback);

        return () => {
            window.removeEventListener('resize', treeUpdateCallback);
        }
    }, [
        treeUpdateCallback,
    ]);
}
// #endregion module



// #region exports
export default useViewResize;
// #endregion exports
