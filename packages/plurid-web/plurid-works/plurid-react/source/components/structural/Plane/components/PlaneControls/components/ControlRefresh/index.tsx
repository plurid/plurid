// #region imports
    // #region libraries
    import React from 'react';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconReset,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries
// #region imports



// #region module
export interface ControlRefreshProperties {
    // #region required
        // #region values
        theme: Theme;
        // #endregion values

        // #region methods
        refreshPlane: () => void;
        // #endregion methods
    // #endregion required
}

const ControlRefresh: React.FC<ControlRefreshProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            theme,
            // #endregion values

            // #region methods
            refreshPlane,
            // #endregion methods
        // #endregion required
    } = properties;
    // #endregion properties


    // #region render
    return (
        <PluridIconReset
            atClick={() => {
                refreshPlane();
            }}
            theme={theme}
            title="refresh"
        />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ControlRefresh;
// #endregion exports
