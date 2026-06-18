// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid as pluridTheme,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region internal
    import {
        StyledSwitch,
        StyledSwitchSlider,
        StyledSwitchIcon,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface SwitchProperties {
    checked: boolean;

    theme?: Theme;
    level?: number;
    round?: boolean;
    exclusive?: boolean;
    accent?: string;
    Icon?: React.FC<any>;

    atChange: () => void;
}

const Switch: React.FC<SwitchProperties> = (
    properties,
) => {
    // #region properties
    const {
        checked,

        theme,
        level,
        round,
        exclusive,
        accent,
        Icon,

        atChange,
    } = properties;

    const _theme = theme || pluridTheme;

    const _level = level === undefined
        ? 0
        : level;

    const _round = round === undefined
        ? true
        : round;

    const commonProperties = {
        theme: _theme,
        level: _level,
        exclusive,
        checked,
        accent,
    };
    // #endregion properties


    // #region render
    return (
        <StyledSwitch
            theme={_theme}
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={() => atChange()}
            />

            <StyledSwitchSlider
                round={_round}
                {...commonProperties}
            />

            {Icon && (
                <StyledSwitchIcon
                    {...commonProperties}
                    style={{
                        left: checked ? '35px' : '9px',
                    }}
                >
                    <Icon />
                </StyledSwitchIcon>
            )}
        </StyledSwitch>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default Switch;
// #endregion exports
