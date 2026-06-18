// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledInputBox {
    theme: Theme;
}

export const StyledInputBox = styled.div<IStyledInputBox>`
    textarea {
        box-sizing: border-box;
        width: 100%;
        min-height: 5rem;
        resize: vertical;
        outline: none;
        border: none;
        padding: 0.9rem;
        font-size: 0.8rem;
        border-radius: 0.9rem;
        line-height: 1.5;

        font-family: ${
            ({
                theme,
            }: IStyledInputBox) => theme.fontFamilySansSerif
        };
        color: ${
            ({
                theme,
            }: IStyledInputBox) => theme.colorPrimary
        };
        background-color: ${
            ({
                theme,
            }: IStyledInputBox) => theme.backgroundColorTertiary
        };
        box-shadow: inset 0px 4px 4px ${
            ({
                theme,
            }: IStyledInputBox) => theme.boxShadowUmbraColor
        };


        ::placeholder {
            color: ${
                ({
                    theme,
                }: IStyledInputBox) => theme.colorSecondary
            };
        }
    }
`;


export interface IStyledTextBox {
    theme: Theme;
}

export const StyledTextBox = styled.div<IStyledTextBox>`
`;
// #endregion module
