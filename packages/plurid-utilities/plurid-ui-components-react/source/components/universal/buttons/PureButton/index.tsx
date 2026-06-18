// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';

    import PluridSpinner from '~components/universal/markers/Spinner';
    // #endregion external


    // #region internal
    import {
        StyledPureButton,
        StyledPureButtonDiv,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface PureButtonProperties {
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
        size?: Sizes;
        disabled?: boolean;
        loading?: boolean;

        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const PureButton: React.FC<PureButtonProperties> = (
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
            size: sizeProperty,
            disabled,
            loading,

            style,
            className,
            // #endregion values

            // #region methods
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || pluridTheme;
    const level = levelProperty ?? 0;
    const size = sizeProperty || 'normal';
    // #endregion properties


    // #region render
    if (loading) {
        return (
            <StyledPureButtonDiv
                style={{
                    ...style,
                }}
                className={className}

                theme={theme}
                level={level}
                size={size}
                isDisabled={disabled}
            >
                <PluridSpinner
                    theme={theme}
                    size="small"
                />
            </StyledPureButtonDiv>
        );
    }

    return (
        <StyledPureButton
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
            size={size}
            isDisabled={disabled}
        >
            {text}
        </StyledPureButton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default PureButton;
// #endregion exports
