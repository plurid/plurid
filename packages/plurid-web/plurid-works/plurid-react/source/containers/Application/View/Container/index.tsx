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
}

const PluridViewContainer: React.FC<PluridViewContainerProperties> = (
    _properties,
) => {
    // #region render
    return (
        <>
            <PluridSpace />
            <PluridOrigin />
            <PluridToolbar />
            <PluridViewcube />
            <PluridMinimap />
            <PluridShortcuts />
        </>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridViewContainer;
// #endregion exports
