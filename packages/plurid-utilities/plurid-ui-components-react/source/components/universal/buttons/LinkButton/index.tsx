// #region imports
    // #region libraries
    import React from 'react';

    import {
        Theme,
        plurid as pluridTheme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import PluridSpinner from '~components/universal/markers/Spinner';
    // #endregion external


    // #region internal
    import {
        StyledLinkButton,
        StyledLinkButtonLoading,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
const DEFAULT_LEVEL = 0;

export interface LinkButtonProperties {
    // #region required
        // #region values
        text: string | JSX.Element;
        // #endregion values

        // #region methods
        atClick: (
            event: React.MouseEvent,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        theme?: Theme;
        level?: number;
        inline?: boolean;
        disabled?: boolean;
        loading?: boolean;
        active?: boolean;

        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const LinkButton: React.FC<LinkButtonProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            text,
            // #endregion values

            // #region methods
            atClick,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            level: levelProperty,
            inline,
            disabled,
            loading,
            active,

            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || pluridTheme;
    const level = levelProperty ?? DEFAULT_LEVEL;
    // #endregion properties


    // #region render
    if (loading) {
        return (
            <StyledLinkButtonLoading>
                <PluridSpinner
                    size="small"
                    theme={theme}
                />
            </StyledLinkButtonLoading>
        );
    }

    return (
        <StyledLinkButton
            onClick={(
                event: React.MouseEvent,
            ) => disabled
                ? null
                : atClick(event)
            }
            style={{
                ...style,
            }}
            className={className}

            theme={theme}
            level={level}
            inline={inline}
            isDisabled={disabled}
            isActive={active}
        >
            {text}
        </StyledLinkButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default LinkButton;
// #endregion exports
