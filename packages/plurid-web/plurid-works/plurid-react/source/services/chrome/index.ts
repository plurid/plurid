// #region imports
    // #region libraries
    import {
        PluridConfiguration,
        PluridPubSub,
        CameraState,
        PluridStateHistory,
    } from '@plurid/plurid-data';
    import {
        Look,
        LookTokens,
    } from '@plurid/plurid-themes';
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
    | 'dockRail' | 'shortcuts' | 'planeControls' | 'resizeHandles' | 'marquee' | 'alignmentGuides' | 'debugger';

const MODE_RANK: Record<ChromeMode, number> = { none: 0, minimal: 1, full: 2 };

const LEAST_MODE: Record<ChromePiece, ChromeMode> = {
    origin: 'full',
    toolbar: 'full',
    viewcube: 'full',
    minimap: 'full',
    dockRail: 'minimal',
    shortcuts: 'minimal',
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


/**
 * What a `render*` slot is called with: enough to draw any piece of chrome without reaching into the
 * store. Everything here is also reachable through the hooks (`useLook`, `useCamera`, `useSelection`,
 * `usePluridHistory`, `usePluridPubSub`), which a slot rendered inside the application may use directly.
 */
export interface PluridChromeContext {
    /** The look in force: its name, base and tokens. */
    look: Look;
    /** The look's tokens (`look.tokens`), for a slot that only needs the values. */
    tokens: LookTokens;
    /** The live camera (changes on every orbit frame). */
    camera: CameraState;
    /** The docked page's id (the page presentation), `''` when the space is revealed or in the space presentation. */
    docked: string;
    presentation: 'space' | 'page';
    /** The ids of the selected planes. */
    selection: string[];
    history: PluridStateHistory;
    configuration: PluridConfiguration;
    /** The application's default bus. */
    pubsub: PluridPubSub;
}

/**
 * A plane's slot (`renderPlaneControls`, `renderPlaneBridge`) gets the plane and the frame-stable part
 * of the chrome context — not the live camera, the selection or the history, which would re-render
 * every plane per frame; a slot that needs them reads `useCamera` / `useSelection` / `usePluridHistory`.
 */
export interface PluridPlaneChromeContext extends Omit<PluridChromeContext, 'camera' | 'selection' | 'history'> {
    planeID: string;
    route: string;
    /** The plane's tree node: its location, size, lineage, bridge. */
    treePlane: unknown;
    parentTreePlane?: unknown;
    /** The pointer is over the plane. */
    mouseOver: boolean;
}
// #endregion module
