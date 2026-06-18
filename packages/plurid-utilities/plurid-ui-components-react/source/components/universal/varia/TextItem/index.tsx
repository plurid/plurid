// #region imports
    // #region libraries
    import React from 'react';

    import {
        PluridIconInfo,
        PluridIconProperties,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region internal
    import {
        StyledTextItem,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface TextItemProperties {
    // #region required
        // #region values
        name: string;
        render: JSX.Element;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        icon?: React.FC<PluridIconProperties>;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const TextItem: React.FC<TextItemProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            name,
            render,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            icon: IconProperty,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const Icon = IconProperty || PluridIconInfo;
    // #endregion properties


    // #region render
    return (
        <StyledTextItem>
            <Icon
                title={name}
                inactive={true}
                style={{
                    marginRight: '0.5rem',
                }}
            />

            {render}
        </StyledTextItem>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default TextItem;
// #endregion exports
