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


    // #region external
    import {
        StyledPlaneControlButton,
    } from '../../styled';
    // #endregion external
// #region imports



// #region module
export interface ControlRefreshProperties {
    // #region required
        // #region values
        theme: Theme;
        refreshing: boolean;
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
            refreshing,
            // #endregion values

            // #region methods
            refreshPlane,
            // #endregion methods
        // #endregion required
    } = properties;
    // #endregion properties


    // #region render
    // a real button (it was a `div` with a click: no role, no name, out of the Tab order)
    return (
        <StyledPlaneControlButton
            type="button"
            aria-label="refresh this plane"
            title="refresh"
            data-plurid-control="plane-refresh"
            disabled={refreshing}
            onClick={() => {
                refreshPlane();
            }}
            style={{
                opacity: refreshing ? 0 : 1,
            }}
        >
            <PluridIconReset
                theme={theme}
            />
        </StyledPlaneControlButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ControlRefresh;
// #endregion exports
