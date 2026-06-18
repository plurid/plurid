// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledFormbutton {
    theme: Theme,
    level: number;
    inactive: boolean;
    devisible: boolean;
    hoverEffect: boolean;
}

export const StyledFormbutton = styled.div<IStyledFormbutton>`
    display: grid;
    grid-template-columns: 20px 1fr;
    grid-gap: 0.5rem;
    align-items: center;
    min-height: 2rem;
    user-select: none;
    text-decoration: none;
    padding: 0.3rem 0.7rem;

    margin: ${(props: IStyledFormbutton) => {
        if (props.devisible) {
            return '0';
        }
        return 'initial';
    }};
    cursor: ${(props: IStyledFormbutton) => {
        if (props.inactive) {
            return 'default';
        }
        return 'pointer';
    }};
    color: ${(props: IStyledFormbutton) => {
        return props.theme.colorPrimary;
    }};

    :hover {
        background-color: ${(props: IStyledFormbutton) => {
            if (!props.hoverEffect) {
                return 'initial';
            }

            if (props.inactive || props.devisible) {
                return 'initial';
            }

            return props.theme.backgroundColorSecondary;
        }};
    }
`;


export interface IStyledFormbuttonIcon {
    theme: Theme,
    position: 'left' | 'center' | 'right';
}

export const StyledFormbuttonIcon = styled.div<IStyledFormbuttonIcon>`
    justify-self: ${(props: IStyledFormbuttonIcon) => {
        return props.position;
    }};
    display: grid;
    place-content: center;
`;


export const StyledFormbuttonText = styled.div`
`;
// #endregion module
