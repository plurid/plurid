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

    import PluridTextline, {
        TextlineProperties,
    } from '../Textline';
    // #endregion external


    // #region internal
    import {
        StyledInputLine,
    } from './styled';
    // #endregion internal
// #endregion imports



// #region module
export interface InputLineProperties {
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
        type?: 'text' | 'password';
        error?: boolean;
        textline?: Partial<TextlineProperties>;
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

const InputLine: React.FC<InputLineProperties> = (
    properties,
) => {
    // #region properties
    const {
        // #region required
            // #region values
            name,
            text,
            // #endregion values

            // #region methods
            atChange,
            // #endregion methods
        // #endregion required

        // #region optional
            // #region values
            theme: themeProperty,
            type,
            error,
            textline,
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
        <StyledInputLine
            theme={theme}
            style={{
                ...style,
            }}
            className={className}
        >
            <PluridInputDescriptor
                name={name}
                show={text !== ''}
                theme={theme}
            />

            <PluridTextline
                text={text}
                type={type}
                placeholder={name}

                theme={theme}
                level={2}
                error={error}

                spellCheck={false}
                autoCapitalize="false"
                autoComplete="false"
                autoCorrect="false"

                atChange={atChange}
                atKeyDown={atKeyDown}

                {...textline}
            />
        </StyledInputLine>
    );
    // #endregion render
}
// #endregion module



// #region exports
export default InputLine;
// #endregion exports
