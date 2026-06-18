// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledLinkButton {
    theme: Theme;
    level: number;
    isDisabled?: boolean;
    inline?: boolean;
    isActive?: boolean;
}

export const StyledLinkButton: any = styled.button<IStyledLinkButton>`
    font-family: ${
        ({
            theme,
        }: IStyledLinkButton) => theme.fontFamilySansSerif
    };

    color: ${
        ({
            theme,
            level,
            isDisabled,
        }: IStyledLinkButton) => {
            if (isDisabled) {
                return theme.backgroundColorPrimaryAlpha;
            }

            switch (level) {
                case 0:
                    return theme.colorPrimary;
                case 1:
                    return theme.colorSecondary;
                case 2:
                    return theme.colorTertiary;
                default:
                    return theme.colorPrimary;
            }
        }
    };
    margin: ${
        ({
            inline,
        }: IStyledLinkButton) => {
            if (inline) {
                return '0';
            }

            return '0 1rem';
        }
    };
    padding: ${
        ({
            inline,
        }: IStyledLinkButton) => {
            if (inline) {
                return '0';
            }

            return 'initial';
        }
    };
    font-size: ${
        ({
            inline,
        }: IStyledLinkButton) => {
            if (inline) {
                return 'inherit';
            }

            return '0.9rem';
        }
    };
    display: ${
        ({
            inline,
        }: IStyledLinkButton) => {
            if (inline) {
                return 'inline';
            }

            return 'grid';
        }
    };
    cursor: ${
        ({
            isDisabled,
        }: IStyledLinkButton) => {
            if (isDisabled) {
                return 'inherit';
            }

            return 'pointer';
        }
    };
    border: none;
    border-bottom: 1px solid ${
        ({
            isActive,
            theme,
        }: IStyledLinkButton) => {
            if (isActive) {
                return theme.colorPrimary;
            }

            return 'transparent';
        }
    };

    font-weight: bold;
    background: transparent;
    place-content: center;
    user-select: none;
    outline: none;
`;


export const StyledLinkButtonLoading = styled.div`
    position: relative;
    min-height: 1rem;
    height: 100%;
    width: 100%;
`;
// #endregion module
