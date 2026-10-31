// #region imports
    // #region libraries
    import {
        Look,
        LookTokens,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridConfiguration,
    } from '../configuration';
    import {
        PluridPubSub,
    } from '../pubsub';
    import {
        PluridStateHistory,
    } from '../../internal/state';
    // #endregion external
    import type {
        PluridScreenRect,
        PluridPlaceOptions,
        PluridPlaceResult,
    } from '../pinned';
// #endregion imports



// #region module
/**
 * What a `render*` slot is called with: enough to draw any piece of chrome without reaching into the
 * store. Everything here is also reachable through the hooks (`useLook`, `useCamera`, `useSelection`,
 * `usePluridHistory`, `usePluridPubSub`), which a slot rendered inside the application may use directly.
 * Never the camera: it changes every orbit frame, and a context that carried it re-rendered every
 * slot per frame; a slot that needs it reads `useCamera`.
 */
export interface PluridChromeContext {
    /** The look in force: its name, base and tokens. */
    look: Look;
    /** The look's tokens (`look.tokens`), for a slot that only needs the values. */
    tokens: LookTokens;
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
 * of the chrome context: not the selection or the history, which would re-render every plane per
 * change; a slot that needs them reads `useSelection` / `usePluridHistory`.
 */
export interface PluridPlaneChromeContext extends Omit<PluridChromeContext, 'selection' | 'history'> {
    planeID: string;
    route: string;
    /** The plane's tree node: its location, size, lineage, bridge. */
    treePlane: unknown;
    parentTreePlane?: unknown;
    /** The pointer is over the plane. */
    mouseOver: boolean;
    /** Ordinary wheel input belongs to this plane under `click-to-scroll`, independent of spatial selection. */
    scrollSelected: boolean;
}

/**
 * A pinned plane's bar (`renderPinnedControls`, 2026-10-31): the plane, where its frame stands, and
 * the commands a host's pin bar needs; the content of the plane is the plane's.
 */
export interface PluridPinnedChromeContext extends Omit<PluridChromeContext, 'selection' | 'history'> {
    planeID: string;
    route: string;
    /** The plane's declared document title, else its path. */
    title: string;
    collapsed: boolean;
    /** The frame in view px. */
    frame: PluridScreenRect;
    /** Put the plane back into the space where its frame is. */
    place: (options?: PluridPlaceOptions) => Promise<PluridPlaceResult>;
    /** Collapse to the title bar, or expand (`false`); a toggle without an argument. */
    collapse: (collapsed?: boolean) => void;
    /** Bring the frame to the front of the pinned planes. */
    raise: () => void;
}
// #endregion module
