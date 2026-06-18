// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridIconLocation,
        PluridIconPosition,
    } from '../interfaces';

    import {
        PLURID_ICON_LOCATION,
        PLURID_ICON_POSITION,
    } from '../enumerations';

    import {
        initial,
        px,
    } from '../constants';
    // #endregion external
// #endregion imports



// #region module
export const StyledPluridIcon = styled.div`
    position: relative;
    display: inline-block;
    box-sizing: border-box;
`;


export interface IStyledPluridIconImage {
    theme: Theme;
    inactive: boolean | undefined;
    iconSize: number;
    opacity: number;
    color: string | undefined;
}

export const StyledPluridIconImage = styled.div<IStyledPluridIconImage>`
    user-select: none;

    cursor: ${
        ({
            inactive,
        }: IStyledPluridIconImage) => inactive ? 'default' : 'pointer'
    };
    opacity: ${
        ({
            opacity,
        }: IStyledPluridIconImage) => opacity
    };

    svg {
        display: block;
        fill: ${
            ({
                theme,
                color,
            }: IStyledPluridIconImage) => {
                if (color) {
                    return color;
                }

                return theme.colorPrimary;
            }
        };
        width: ${
            ({
                iconSize,
            }: IStyledPluridIconImage) => iconSize + px
        };
        max-width: ${
            ({
                iconSize,
            }: IStyledPluridIconImage) => iconSize + px
        };
        height: ${
            ({
                iconSize,
            }: IStyledPluridIconImage) => iconSize + px
        };
    }
`;



export interface IStyledPluridIconTitle {
    theme: Theme;
    iconSize: number;
    position: PluridIconPosition;
    location: PluridIconLocation;
}


export const StyledPluridIconTitle = styled.div<IStyledPluridIconTitle>`
    top: ${
        ({
            iconSize,
            location,
        }: IStyledPluridIconTitle) => {
            let value = 0;

            switch (location) {
                case PLURID_ICON_LOCATION.above:
                    value = -1 * (iconSize + 22);
                    break;
                case PLURID_ICON_LOCATION.left:
                case PLURID_ICON_LOCATION.right:
                    value = -1 * (iconSize / 2 - 1);
                    break;
                case PLURID_ICON_LOCATION.under:
                default:
                    value = iconSize + 10;
            }

            return value + px;
        }
    };
    left: ${
        ({
            position,
            location,
            iconSize,
        }: IStyledPluridIconTitle) => {
            if (location) {
                switch (location) {
                    case PLURID_ICON_LOCATION.left:
                        return initial;
                    case PLURID_ICON_LOCATION.right:
                        return (iconSize + 10) + px;
                }
            }

            switch (position) {
                case PLURID_ICON_POSITION.left:
                    return '0';
                case PLURID_ICON_POSITION.center:
                    return '50%';
                case PLURID_ICON_POSITION.right:
                    return '100%';
                default:
                    return '50%';
            }
        }
    };
    right: ${
        ({
            location,
            iconSize,
        }: IStyledPluridIconTitle) => {
            if (location) {
                switch (location) {
                    case PLURID_ICON_LOCATION.left:
                        return (iconSize + 10) + px;
                }
            }

            return initial;
        }
    };
    transform: ${
        ({
            position,
            location,
        }: IStyledPluridIconTitle) => {
            if (location) {
                switch (location) {
                    case PLURID_ICON_LOCATION.left:
                    case PLURID_ICON_LOCATION.right:
                        return initial;
                }
            }

            let value = '';

            switch (position) {
                case PLURID_ICON_POSITION.left:
                    value = '0';
                    break;
                case PLURID_ICON_POSITION.right:
                    value = '-100';
                    break;
                case PLURID_ICON_POSITION.center:
                default:
                    value = '-50';
            }

            return `translateX(${value}%)`;
        }
    };
    background-color: ${
        ({
            theme,
        }: IStyledPluridIconTitle) => theme.backgroundColorSecondary
    };
    box-shadow: ${
        ({
            theme,
        }: IStyledPluridIconTitle) => theme.boxShadowUmbra
    };
    color: ${
        ({
            theme,
        }: IStyledPluridIconTitle) => theme.colorPrimary
    };

    position: absolute;
    padding: 0.4rem;
    z-index: 999999;

    font-size: 0.8rem;
    font-family: ${
        ({
            theme,
        }: IStyledPluridIconTitle) => theme.fontFamilySansSerif
    };

    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    opacity: 1;
`;
// #endregion module
