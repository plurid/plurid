// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPureButton {
    theme: Theme;
    size: Sizes;
    level: number;
    isDisabled?: boolean;
}

export const StyledPureButton: any = styled.button<IStyledPureButton>`
    color: ${
        ({
            theme,
        }: IStyledPureButton) => theme.colorPrimary
    };
    background-color: ${
        ({
            theme,
            level,
            isDisabled,
        }: IStyledPureButton) => {
            if (isDisabled) {
                return theme.backgroundColorPrimaryAlpha;
            }

            switch (level) {
                case 0:
                    return theme.backgroundColorPrimary;
                case 1:
                    return theme.backgroundColorSecondary;
                case 2:
                    return theme.backgroundColorTertiary;
                case 3:
                    return theme.backgroundColorQuaternary;
                default:
                    return theme.backgroundColorPrimary;
            }
        }
    };
    box-shadow: 0px 8px 8px 0px ${
        ({
            theme,
        }: IStyledPureButton) => theme.boxShadowUmbraColor
    };

    box-sizing: border-box;
    display: block;
    width: 100%;
    min-width: ${
        ({
            size,
        }: IStyledPureButton) => {
            switch (size) {
                case 'small':
                    return '8rem';
                case 'normal':
                    return '10rem';
                case 'large':
                    return '12rem';
                default:
                    return '10rem';
            }
        }
    };
    border-radius: ${
        ({
            size,
        }: IStyledPureButton) => {
            switch (size) {
                case 'small':
                    return '1rem';
                case 'normal':
                    return '1.2rem';
                case 'large':
                    return '1.4rem';
                default:
                    return '1.2rem';
            }
        }
    };
    padding: ${
        ({
            size,
        }: IStyledPureButton) => {
            switch (size) {
                case 'small':
                    return '0 1.2rem';
                case 'normal':
                    return '0 1.4rem';
                case 'large':
                    return '0 1.6rem';
                default:
                    return '0 1.4rem';
            }
        }
    };

    font-family: ${
        ({
            theme,
        }: IStyledPureButton) => theme.fontFamilySansSerif
    };
    font-size: ${
        ({
            size,
        }: IStyledPureButton) => {
            switch (size) {
                case 'small':
                    return '0.8rem';
                case 'normal':
                    return '0.9rem';
                case 'large':
                    return '1rem';
                default:
                    return '0.9rem';
            }
        }
    };
    height: ${
        ({
            size,
        }: IStyledPureButton) => {
            switch (size) {
                case 'small':
                    return '2rem';
                case 'normal':
                    return '2.4rem';
                case 'large':
                    return '2.8rem';
                default:
                    return '2.4rem';
            }
        }
    };
    cursor: ${
        ({
            isDisabled,
        }: IStyledPureButton) => {
            if (isDisabled) {
                return 'default';
            }

            return 'pointer';
        }
    };


    border: none;
    outline: none;
    user-select: none;
    display: grid;
    place-content: center;
    line-height: 1.2;
    font-weight: bold;
    transition: box-shadow 200ms linear, background-color 200ms linear;
    position: relative;
    min-height: 40px;
    min-width: 160px;

    @media (hover: hover) {
        :hover {
            background-color: ${
                ({
                    theme,
                    level,
                    isDisabled,
                }: IStyledPureButton) => {
                    if (isDisabled) {
                        return theme.backgroundColorPrimaryAlpha;
                    }

                    switch (level) {
                        case 0:
                            return theme.backgroundColorSecondary;
                        case 1:
                            return theme.backgroundColorTertiary;
                        case 2:
                            return theme.backgroundColorQuaternary;
                        case 3:
                            return theme.backgroundColorPrimary;
                        default:
                            return theme.backgroundColorSecondary;
                    }
                }
            };
        }
    }

    :active {
        box-shadow: ${
            ({
                theme,
                isDisabled,
            }: IStyledPureButton) => {
                if (isDisabled) {
                    return '0px 8px 8px 0px ' + theme.boxShadowUmbraColor;
                }

                return '0px 3px 3px 0px ' + theme.boxShadowUmbraColor;
            }
        };
    }
`;


export type IStyledPureButtonDiv = {
    theme: Theme;
    level: number;
    isDisabled?: boolean;
} & any; // FORCED

export const StyledPureButtonDiv = styled(StyledPureButton).attrs<IStyledPureButtonDiv>({
    as: 'div',
})`
    background-color: ${
        ({
            theme,
            level,
            isDisabled,
        }: IStyledPureButtonDiv) => {
            if (isDisabled) {
                return '';
            }

            switch (level) {
                case 0:
                    return theme.backgroundColorSecondary;
                case 1:
                    return theme.backgroundColorTertiary;
                case 2:
                    return theme.backgroundColorQuaternary;
                case 3:
                    return theme.backgroundColorPrimary;
                default:
                    return theme.backgroundColorSecondary;
            }
        }
    };
    box-shadow: 0px 3px 3px 0px ${
        ({
            theme,
        }: IStyledPureButtonDiv) => theme.boxShadowUmbraColor
    };
`;
// #endregion module
