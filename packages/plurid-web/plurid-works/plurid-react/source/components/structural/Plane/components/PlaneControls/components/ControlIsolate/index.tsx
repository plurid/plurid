// #region imports
    // #region libraries
    import React from 'react';


    import {
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconRectangle,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries
// #region imports



// #region module
export interface ControlIsolateProperties {
    // #region required
        // #region values
        theme: Theme;
        isolated: boolean;
        // #endregion values

        // #region methods
        isolatePlane: () => void;
        // #endregion methods
    // #endregion required
}

const ControlIsolate: React.FC<ControlIsolateProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            theme,
            isolated,
            // #endregion values

            // #region methods
            isolatePlane,
            // #endregion methods
        // #endregion required
    } = properties;
    // #endregion properties


    // #region render
    const title = isolated ? 'isolated' : 'isolate';
    const fill = isolated ? true : false;

    return (
        <PluridIconRectangle
            atClick={() => {
                isolatePlane();
            }}
            theme={theme}
            title={title}
            fill={fill}
        />
    );
    // #endregion render
}
// #endregion module



// #region exports
export default ControlIsolate;
// #endregion exports
