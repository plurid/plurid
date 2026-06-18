// #region imports
    // #region libraries
    import React from 'react';

    import {
        plurid,
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import PluridInputDescriptor from '../InputDescriptor';
    // #endregion external


    // #region internal
    import {
        StyledInputBox,
        StyledTextBox,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface InputBoxProperties {
    // #region required
        // #region values
        name: string;
        text: string;
        // #endregion values

        // #region methods
        atChange: (
            event: React.ChangeEvent<HTMLInputElement>,
        ) => void;
        // #endregion methods
    // #endregion required

    // #region optional
        // #region values
        theme?: Theme;
        style?: React.CSSProperties;
        className?: string;
        // #endregion values

        // #region methods
        atKeyDown?: (
            event: React.KeyboardEvent<HTMLInputElement>,
        ) => void;
        // #endregion methods
    // #endregion optional
}

const InputBox: React.FC<InputBoxProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            text,
            name,
            // #endregion values

            // #region methods
            atChange,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            style,
            className,
            // #endregion values

            // #region methods
            atKeyDown,
            // #endregion methods
        // #endregion optional
    } = properties;

    const theme = themeProperty || plurid;
    // #endregion properties


    // #region render
    return (
        <StyledInputBox
            theme={theme}
            className={className}
            style={{
                ...style,
            }}
        >
            <PluridInputDescriptor
                name={name}
                show={text !== ''}
                theme={theme}
            />

            <StyledTextBox
                theme={theme}
            >
                <textarea
                    value={text}
                    placeholder={name}
                    onChange={(event) => atChange(event as any)}
                    onKeyDown={(event) => atKeyDown ? atKeyDown(event as any) : null}
                    spellCheck={false}
                    autoCapitalize="false"
                    autoComplete="false"
                    autoCorrect="false"
                />
            </StyledTextBox>
        </StyledInputBox>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default InputBox;
// #endregion exports
