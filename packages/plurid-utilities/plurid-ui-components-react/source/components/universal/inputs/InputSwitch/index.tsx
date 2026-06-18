// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import PluridSwitch, {
        SwitchProperties,
    } from '../Switch';
    import PluridFormLeftRight from '../../form/FormLeftRight';
    // #endregion external


    // #region internal
    import {
        StyledInputSwitch,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface InputSwitchProperties {
    // #region required
        // #region values
        name: string;
        checked: boolean;
        // #endregion values

        // #region methods
        atChange: () => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        theme?: Theme;
        compact?: boolean;
        switch?: SwitchProperties;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        // #endregion methods
    // #endregion optional
}

const InputSwitch: React.FC<InputSwitchProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            name,
            checked,
            // #endregion values

            // #region methods
            atChange,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            compact,
            switch: switchProperties,
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
        <StyledInputSwitch
            compact={compact}
            style={{
                ...style,
            }}
            className={className}
        >
            <PluridFormLeftRight>
                <div
                    style={{
                        marginLeft: '0.9rem',
                    }}
                >
                    {name}
                </div>

                <PluridSwitch
                    checked={checked}
                    level={2}
                    exclusive={true}
                    theme={theme}
                    atChange={() => atChange()}
                    {...switchProperties}
                />
            </PluridFormLeftRight>
        </StyledInputSwitch>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default InputSwitch;
// #endregion exports
