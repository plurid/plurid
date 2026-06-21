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
    import PluridShortcuts from '~components/utilities/Shortcuts';
    // #endregion external
// #region imports



// #region module
export interface PluridViewContainerProperties {
    /**
     * Optional render-slots — when provided, each REPLACES the engine's default overlay (rendered at
     * the same spot). Omit to keep the default. The `elements.*.show` flags / `global.micro` still
     * apply to the defaults; a slot bypasses them entirely (the host owns that element).
     */
    renderToolbar?: () => unknown;
    renderViewcube?: () => unknown;
    renderMinimap?: () => unknown;
    renderShortcuts?: () => unknown;
}

const PluridViewContainer: React.FC<PluridViewContainerProperties> = (
    properties,
) => {
    const {
        renderToolbar,
        renderViewcube,
        renderMinimap,
        renderShortcuts,
    } = properties;

    // #region render
    return (
        <>
            <PluridSpace />
            <PluridOrigin />
            {renderToolbar ? renderToolbar() as React.ReactNode : <PluridToolbar />}
            {renderViewcube ? renderViewcube() as React.ReactNode : <PluridViewcube />}
            {renderMinimap ? renderMinimap() as React.ReactNode : <PluridMinimap />}
            {renderShortcuts ? renderShortcuts() as React.ReactNode : <PluridShortcuts />}
        </>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridViewContainer;
// #endregion exports
