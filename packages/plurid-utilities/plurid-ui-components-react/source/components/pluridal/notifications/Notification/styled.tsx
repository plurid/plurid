// #region imports
    // #region libraries
    import styled, {
        keyframes,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
const translateUp = keyframes`
    from {
        transform: translateY(2000px);
    }
    to {
        transform: translateY(0);
    }
`;


export interface IStyledNotification {
    theme: Theme;
}

export const StyledNotification = styled.div<IStyledNotification>`
    display: grid;
    align-items: center;
    position: relative;
    min-height: 60px;
    width: 260px;
    margin: 10px 20px;
    border-radius: 10px;
    pointer-events: all;
    background-color: ${(props: IStyledNotification) => {
        return props.theme.backgroundColorSecondary;
    }};
    color: ${(props: IStyledNotification) => {
        return props.theme.colorPrimary;
    }};
    box-shadow: ${(props: IStyledNotification) => {
        return props.theme.boxShadowUmbra;
    }};
    animation: ${translateUp} 750ms ease-in-out forwards;
    transition: opacity 400ms;

    a {
        text-decoration: none;
        color: ${(props: IStyledNotification) => {
            return props.theme.colorSecondary;
        }};
    }
`;



export interface IStyledNotificationContent {
    wordBreak: string;
}

export const StyledNotificationContent = styled.div<IStyledNotificationContent>`
    font-size: 0.9rem;
    padding: 32px 16px;
    word-break: ${
        ({
            wordBreak,
        }) => wordBreak
    };
`;


export const StyledNotificationClose = styled.div`
    position: absolute;
    top: 8px;
    right: 8px;
    user-select: none;
    cursor: pointer;
    width: 20px;
    height: 20px;
    display: grid;
    place-content: center;
`;
// #endregion module
