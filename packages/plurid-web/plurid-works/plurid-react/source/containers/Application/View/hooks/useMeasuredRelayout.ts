// #region imports
    // #region libraries
    import {
        useEffect,
        useRef,
    } from 'react';

    import {
        TreePlane,
        PluridStateSpace,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
export interface UseMeasuredRelayoutParameters {
    tree: TreePlane[];
    resolvedLayout: boolean;
    motion: PluridStateSpace['motion'];
    layoutTransition: number;
    /** `space.layout.type`: the sheaves cascade does not read the sizes. */
    layoutType: string;
    /** The configured plane height: when set every root is that tall and the layout is already right. */
    configuredHeight: number;
    /** The View's relayout (`treeUpdate` with `layout: true`), called on the coalesced frame with the latest closure. */
    relayout: (options: { transition: boolean }) => void;
}

/** What a relayout depends on: the sizes of the roots the layout places (a pinned or hand-sized root is left alone). */
export const measuredSizesSignature = (
    tree: TreePlane[],
): string => tree
    .map((root) => (
        root.show === false || root.manuallyPositioned || root.sizeMode === 'manual'
            ? '-'
            : root.width + 'x' + root.height
    ))
    .join('|');


/**
 * THE SIZING CONTRACT: a root's measured height changes → the roots are relaid by their current
 * sizes, once per frame, gliding (`transition`) after the boot's first measured relayout (the
 * fallback height was a guess; that one is instant), never during a gesture, a fling, a tween or
 * a running layout transition (deferred to the next idle commit — a press that starts between the
 * effect and its frame defers it too). The relayout changes transforms only, so no measurement
 * follows it: the loop is closed by construction.
 */
export const useMeasuredRelayout = (
    {
        tree,
        resolvedLayout,
        motion,
        layoutTransition,
        layoutType,
        configuredHeight,
        relayout,
    }: UseMeasuredRelayoutParameters,
) => {
    /** The signature the last run saw (`undefined` before the first layout). */
    const previous = useRef<string | undefined>(undefined);
    /** A change waits for an idle commit. */
    const pending = useRef(false);
    const frame = useRef<number | null>(null);
    /** The first measured relayout is instant; later ones glide. */
    const measuredOnce = useRef(false);
    const latest = useRef(relayout);
    latest.current = relayout;
    /** The gate as of the latest render: the frame re-checks it (a press may start meanwhile). */
    const gate = useRef({ motion, layoutTransition });
    gate.current = { motion, layoutTransition };

    useEffect(() => {
        if (!resolvedLayout || layoutType === 'SHEAVES' || configuredHeight > 0) {
            return;
        }
        const signature = measuredSizesSignature(tree);
        if (previous.current === undefined) {
            previous.current = signature;
            return;
        }
        if (signature !== previous.current) {
            previous.current = signature;
            pending.current = true;
        }
        if (!pending.current) {
            return;
        }
        if (motion !== 'idle' || layoutTransition > 0) {
            // deferred: the effect re-runs when the motion settles or the transition closes
            return;
        }
        if (frame.current !== null || typeof requestAnimationFrame !== 'function') {
            return;
        }
        frame.current = requestAnimationFrame(() => {
            frame.current = null;
            if (gate.current.motion !== 'idle' || gate.current.layoutTransition > 0) {
                // still pending: the effect re-runs when the motion settles
                return;
            }
            pending.current = false;
            const transition = measuredOnce.current;
            measuredOnce.current = true;
            latest.current({ transition });
        });
    }, [
        tree,
        resolvedLayout,
        motion,
        layoutTransition,
        layoutType,
        configuredHeight,
    ]);

    useEffect(() => () => {
        if (frame.current !== null && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(frame.current);
            frame.current = null;
        }
    }, []);
};
// #endregion module



// #region exports
export default useMeasuredRelayout;
// #endregion exports
