// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledInputDescriptor,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface InputDescriptorProperties {
    // #region required
        // #region values
        name: string;
        show: boolean;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const InputDescriptor: React.FC<InputDescriptorProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            name,
            show,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || plurid;
    // #endregion properties


    // #region render
    return (
        <StyledInputDescriptor
            theme={theme}
            className={className}
            style={{
                ...style,
            }}
        >
            {show && (
                <>
                    {name}
                </>
            )}
        </StyledInputDescriptor>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default InputDescriptor;
// #endregion exports
