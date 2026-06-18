// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';

    import {
        PluridIconProperties,
    } from '@plurid/plurid-icons-react';
    // #endregion libraries


    // #region internal
    import {
        StyledFormbutton,
        StyledFormbuttonIcon,
        StyledFormbuttonText,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface FormbuttonProperties {
    text: string;
    Icon: React.FC<PluridIconProperties>;
    atClick: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;

    link?: string;
    target?: string;
    theme?: Theme;
    devisible?: boolean;
    level?: number;
    iconPosition?: 'left' | 'center' | 'right';
    /**
     * Renders the button as is (without hover, cursor effects, and on click listen).
     */
    inactive?: boolean;
    hoverEffect?: boolean;

    style?: React.CSSProperties;
    className?: string;
}

/**
 * Renders an icon and a descriptive text, button-like.
 *
 * @param properties
 */
const Formbutton: React.FC<FormbuttonProperties> = (
    properties,
) => {
    // #region properties
    const {
        /** required */
        text,
        Icon,
        atClick,

        /** optional */
        link,
        target,
        theme,
        devisible,
        level,
        iconPosition,
        inactive,
        hoverEffect: hoverEffectProperty,
        style,
        className,
    } = properties;

    const _theme = theme || pluridTheme
    const _level = level ?? 0;
    const _devisible = devisible ?? false;
    const _iconPosition = iconPosition || 'left';
    const _inactive = inactive ?? false
    const hoverEffect = hoverEffectProperty ?? true;
    // #endregion properties


    // #region render
    const render = () => (
        <>
            <StyledFormbuttonIcon
                position={_iconPosition}
            >
                <Icon
                    theme={_theme}
                />
            </StyledFormbuttonIcon>

            <StyledFormbuttonText>
                {text}
            </StyledFormbuttonText>
        </>
    );

    const renderProperties = {
        style: {...style},
        className: className,
        theme: _theme,
        level: _level,
        inactive: _inactive,
        devisible: _devisible,
        hoverEffect,
    };


    if (link) {
        return (
            <StyledFormbutton
                onClick={(event: any) => !_inactive ? atClick(event) : null }
                as={'a'}
                href={link}
                target={target}
                {...renderProperties}
            >
                {render()}
            </StyledFormbutton>
        );
    }

    return (
        <StyledFormbutton
            onClick={(event: any) => !_inactive ? atClick(event as any) : null }
            {...renderProperties}
        >
            {render()}
        </StyledFormbutton>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Formbutton;
// #endregion exports
