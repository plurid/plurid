// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        HorizontalPositions,
    } from '~data/enumerations';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledToolbar {
    position: keyof typeof HorizontalPositions;
}

export const StyledToolbar = styled.div<IStyledToolbar>`
    left: ${(props: IStyledToolbar) => {
        if (props.position === HorizontalPositions.left) {
            return '0';
        }
        return 'initial';
    }};
    right: ${(props: IStyledToolbar) => {
        if (props.position === HorizontalPositions.right) {
            return '0';
        }
        return 'initial';
    }};

    pointer-events: none;
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
`;


export interface IStyledToolbarButtons {
    theme: Theme;
}

export const StyledToolbarButtons = styled.div<IStyledToolbarButtons>`
    background-color: ${(props: IStyledToolbarButtons) => {
        return props.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(props: IStyledToolbarButtons) => {
        return props.theme.boxShadowUmbra;
    }};

    pointer-events: all;
    display: grid;
    place-content: center;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    border-radius: 15px;
    margin: 0 15px;
    font-size: 12px;
    opacity: 1;
    width: 30px;
    height: auto;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    transition: opacity 300ms ease-in-out;
    z-index: 9999;
    user-select: none;
`;
// #endregion module
