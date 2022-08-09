// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region external
    import PluridSpace from '~components/structural/Space';
    import PluridOrigin from '~components/utilities/Origin';
    import PluridToolbar from '~components/utilities/Toolbar/General';
    import PluridViewcube from '~components/utilities/Viewcube';
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
        </>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PluridViewContainer;
// #endregion exports
