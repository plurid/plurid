// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries

    // #region external
    import PluridSpace from '~components/structural/Space';
    import PluridOrigin from '~components/utilities/Origin';
    import PluridToolbar from '~components/utilities/Toolbar/General';
    import PluridViewcube from '~components/utilities/Viewcube';
    import PluridMinimap from '~components/utilities/Minimap';
    import PluridDockRail from '~components/utilities/DockRail';
    import PluridShortcuts from '~components/utilities/Shortcuts';

    import {
        ChromeMode,
        PluridChromeContext,
        showsChrome,
    } from '~services/chrome';
    // #endregion external
// #region imports



// #region module
type Slot = (context: PluridChromeContext) => unknown;

export interface PluridViewContainerProperties {
    /** `elements.chrome`: how much of the default chrome renders. A slot renders whatever the mode. */
    mode: ChromeMode;
    /** What every slot is called with. */
    context: PluridChromeContext;
    /**
     * Optional render-slots — when provided, each REPLACES the engine's default overlay (rendered at
     * the same spot). Omit to keep the default. The `elements.*.show` flags and the chrome mode still
     * apply to the defaults; a slot bypasses them entirely (the host owns that element).
     */
    renderOrigin?: Slot;
    renderToolbar?: Slot;
    renderViewcube?: Slot;
    renderMinimap?: Slot;
    renderShortcuts?: Slot;
    /** The page presentation's rail (fit · back · the page / cube toggle). */
    renderDockRail?: Slot;
}


const PluridViewContainer: React.FC<PluridViewContainerProperties> = (
    properties,
) => {
    const {
        mode,
        context,
        renderOrigin,
        renderToolbar,
        renderViewcube,
        renderMinimap,
        renderShortcuts,
        renderDockRail,
    } = properties;

    const piece = (
        slot: Slot | undefined,
        name: Parameters<typeof showsChrome>[1],
        fallback: React.ReactNode,
        shown = true,
    ): React.ReactNode => {
        if (slot) {
            return slot(context) as React.ReactNode;
        }
        return shown && showsChrome(mode, name) ? fallback : null;
    };

    const shortcutsShown = context.configuration.elements?.shortcuts?.show !== false;

    // #region render
    return (
        <>
            <PluridSpace />
            {piece(renderOrigin, 'origin', <PluridOrigin />)}
            {piece(renderToolbar, 'toolbar', <PluridToolbar />)}
            {piece(renderViewcube, 'viewcube', <PluridViewcube />)}
            {piece(renderMinimap, 'minimap', <PluridMinimap />)}
            {piece(renderDockRail, 'dockRail', <PluridDockRail />)}
            {piece(renderShortcuts, 'shortcuts', <PluridShortcuts />, shortcutsShown)}
        </>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridViewContainer;
// #endregion exports
