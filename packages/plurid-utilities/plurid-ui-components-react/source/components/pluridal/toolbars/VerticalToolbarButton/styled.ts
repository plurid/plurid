// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledVerticalToolbarButton {
    active: boolean;
    scaleIcon: boolean;
    first: boolean;
    last: boolean;
    theme: Theme;
}

export const StyledVerticalToolbarButton: any = styled.div<IStyledVerticalToolbarButton>`
    position: relative;
    cursor: pointer;
    height: 40px;
    display: grid;
    place-content: center;
    transition: transform 50ms ease-in-out;

    border-top-left-radius: ${(props: IStyledVerticalToolbarButton) => {
        if (props.first) {
            return '15px';
        }
        return '0';
    }};
    border-top-right-radius: ${(props: IStyledVerticalToolbarButton) => {
        if (props.first) {
            return '15px';
        }
        return '0';
    }};

    border-bottom-left-radius: ${(props: IStyledVerticalToolbarButton) => {
        if (props.last) {
            return '15px';
        }
        return '0';
    }};
    border-bottom-right-radius: ${(props: IStyledVerticalToolbarButton) => {
        if (props.last) {
            return '15px';
        }
        return '0';
    }};

    background-color: ${(props: IStyledVerticalToolbarButton) => {
        if (props.active) {
            return props.theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};

    @media (hover: hover) {
        :hover {
            background: ${(props: IStyledVerticalToolbarButton) => {
                return props.theme.backgroundColorTertiary;
            }};
        }

        :hover svg {
            transform: ${(props: IStyledVerticalToolbarButton) => {
                if (props.scaleIcon) {
                    return 'scale(1.2)';
                }
                return '';
            }};
        }
    }

    svg {
        transition: transform 100ms linear;
        width: 15px;
        height: 15px;
        fill: ${(props: IStyledVerticalToolbarButton) => {
            return props.theme.colorPrimary;
        }};
        transform: ${(props: IStyledVerticalToolbarButton) => {
            if (props.active && props.scaleIcon) {
                return 'scale(1.2)';
            }
            return '';
        }};
    }
`;



export interface IStyledVerticalToolbarButtonText {
    textLeft: boolean;
}

export const StyledVerticalToolbarButtonText: any = styled.div<IStyledVerticalToolbarButtonText>`
    left: ${(props: IStyledVerticalToolbarButtonText) => {
        if (props.textLeft) {
            return '-108px';
        }
        return '30px';
    }};
    justify-content: ${(props: IStyledVerticalToolbarButtonText) => {
        if (props.textLeft) {
            return 'flex-end';
        }
        return 'left';
    }};
    text-align: ${(props: IStyledVerticalToolbarButtonText) => {
        if (props.textLeft) {
            return 'right';
        }
        return 'left';
    }};
    padding-left: ${(props: IStyledVerticalToolbarButtonText) => {
        if (props.textLeft) {
            return '0';
        }
        return '8px';
    }};

    pointer-events: none;
    position: absolute;
    height: 40px;
    width: 100px;
    display: flex;
    align-items: center;
`;
// #endregion module
