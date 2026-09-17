// #region imports
    // #region libraries
    import {
        PluridConfiguration,
    } from '@plurid/plurid-data';
    // #endregion libraries
// #endregion imports



// #region module
/** How much engine chrome renders (`elements.chrome`). */
export type ChromeMode = 'full' | 'minimal' | 'none';

export const chromeModeOf = (
    configuration: PluridConfiguration,
): ChromeMode => configuration.elements?.chrome ?? 'full';


/** Every piece of engine chrome, and the least mode that still renders it. */
export type ChromePiece =
    | 'origin' | 'toolbar' | 'viewcube' | 'minimap'
    | 'dockRail' | 'shortcuts' | 'palette' | 'planeControls' | 'resizeHandles' | 'marquee' | 'alignmentGuides' | 'debugger';

const MODE_RANK: Record<ChromeMode, number> = { none: 0, minimal: 1, full: 2 };

const LEAST_MODE: Record<ChromePiece, ChromeMode> = {
    origin: 'full',
    toolbar: 'full',
    viewcube: 'full',
    minimap: 'full',
    dockRail: 'minimal',
    shortcuts: 'minimal',
    palette: 'minimal',
    planeControls: 'minimal',
    resizeHandles: 'minimal',
    marquee: 'minimal',
    alignmentGuides: 'minimal',
    debugger: 'minimal',
};

/** Whether the mode renders the piece (`full` everything; `minimal` the page's affordances and the drag feedback; `none` nothing). */
export const showsChrome = (
    mode: ChromeMode,
    piece: ChromePiece,
): boolean => MODE_RANK[mode] >= MODE_RANK[LEAST_MODE[piece]];


// the context's SHAPE lives in plurid-data, where the slots are typed; the engine draws to it
export type {
    PluridChromeContext,
    PluridPlaneChromeContext,
} from '@plurid/plurid-data';
// #endregion module
