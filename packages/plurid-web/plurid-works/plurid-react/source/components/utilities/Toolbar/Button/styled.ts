// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes/distribution';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledToolbarButton {
    theme: Theme;
    first?: boolean;
    last?: boolean;
    active?: boolean;
    scaleImage?: boolean;
}

export const StyledToolbarButton = styled.div<IStyledToolbarButton>`
    position: relative;
    cursor: pointer;
    height: 40px;
    display: grid;
    place-content: center;
    transition: transform 50ms ease-in-out;

    border-top-left-radius: ${({
        first,
    }) => {
        if (first) {
            return '15px';
        }
        return '0';
    }};
    border-top-right-radius: ${({
        first,
    }) => {
        if (first) {
            return '15px';
        }
        return '0';
    }};

    border-bottom-left-radius: ${({
        last,
    }) => {
        if (last) {
            return '15px';
        }
        return '0';
    }};
    border-bottom-right-radius: ${({
        last,
    }) => {
        if (last) {
            return '15px';
        }
        return '0';
    }};

    background-color: ${({
        theme,
        active,
    }) => {
        if (active) {
            return theme.backgroundColorTertiary;
        }
        return 'transparent';
    }};

    :hover {
        background: ${({
            theme,
        }) => {
            return theme.backgroundColorTertiary;
        }};
    }

    :hover svg {
        transform: ${({
            scaleImage,
        }) => {
            if (scaleImage) {
                return 'scale(1.2)';
            }
            return '';
        }};
    }

    svg {
        transition: transform 100ms linear;
        width: 15px;
        height: 15px;
        fill: ${({
            theme,
        }) => {
            return theme.colorPrimary;
        }};
        transform: ${({
            active,
            scaleImage,
        }) => {
            if (active && scaleImage) {
                return 'scale(1.2)';
            }
            return '';
        }};
    }
`;


export interface IStyledToolbarButtonText {
    textLeft?: boolean;
}

export const StyledToolbarButtonText = styled.div<IStyledToolbarButtonText>`
    left: ${({
        textLeft,
    }) => {
        if (textLeft) {
            return '-88px';
        }
        return '30px';
    }};
    justify-content: ${({
        textLeft,
    }) => {
        if (textLeft) {
            return 'flex-end';
        }
        return 'left';
    }};
    text-align: ${({
        textLeft,
    }) => {
        if (textLeft) {
            return 'right';
        }
        return 'left';
    }};
    padding-left: ${({
        textLeft,
    }) => {
        if (textLeft) {
            return '0';
        }
        return '8px';
    }};

    position: absolute;
    height: 40px;
    width: 80px;
    display: flex;
    align-items: center;
`;
// #endregion module
