// #region imports
import { WHEEL_STREAM_MS } from './wheel';
// #endregion imports

// #region module
export interface PlaneWheelContext {
    planeID: string;
    selectedPlaneID: string;
    /** Explicit navigation intent, including modifiers; changing intent starts a new stream. */
    navigation: string;
}

export type PlaneWheelOwner = 'camera' | 'content' | 'consume';

/** A flick belongs to its first surface, including its momentum tail. Never transfer it on hover. */
export const createPlaneWheelOwnership = (now = () => performance.now()) => {
    let lastAt = -Infinity;
    let navigation = '';
    let contentPlaneID = '';
    let consumed = false;

    const reset = () => {
        lastAt = -Infinity;
        contentPlaneID = '';
        consumed = false;
    };

    return {
        reset,
        resolve(context: PlaneWheelContext): PlaneWheelOwner {
            const at = now();
            if (at - lastAt >= WHEEL_STREAM_MS || context.navigation !== navigation) {
                contentPlaneID =
                    !context.navigation && context.planeID === context.selectedPlaneID
                        ? context.planeID
                        : '';
                consumed = false;
            }
            lastAt = at;
            navigation = context.navigation;
            if (!contentPlaneID) {
                return 'camera';
            }
            if (context.planeID !== contentPlaneID) {
                consumed = true;
            }
            return consumed ? 'consume' : 'content';
        },
    };
};
// #endregion module
