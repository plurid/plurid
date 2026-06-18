// #region imports
    // #region libraries
    import React from 'react';
    // #endregion libraries


    // #region internal
    import {
        StyledNewPageLink,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface NewPageLinkProperties {
    // #region required
        // #region values
        link: string;
        text: string | JSX.Element;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

/**
 * Opens the `link` in new page/tab.
 *
 * @param properties
 */
const NewPageLink: React.FC<NewPageLinkProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            link,
            text,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;
    // #endregion properties


    // #region render
    return (
        <StyledNewPageLink
            href={link}
            target="_blank"
            rel="noopener noreferrer"

            style={{
                ...style,
            }}
            className={className}
        >
            {text}
        </StyledNewPageLink>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default NewPageLink;
// #endregion exports
