// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        chromeControl,
    } from '~services/styled/chrome';

    import {
        Theme,
    } from '@plurid/plurid-themes';
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

/** A menu button: the look's ink; hovered, the wash; active, the accent as ink; the ends of a stack rounded by the look. */
export const StyledToolbarButton = styled.button<IStyledToolbarButton>`
    ${chromeControl}
    border: 0;
    padding: 0;
    margin: 0;
    font: inherit;
    font-family: var(--plurid-font);
    font-size: var(--plurid-font-size);
    font-weight: var(--plurid-weight);
    color: ${({ active }) => (active ? 'var(--plurid-accent)' : 'var(--plurid-ink)')};
    background: transparent;
    position: relative;

    &:focus-visible {
        outline: 2px solid var(--plurid-focus);
        outline-offset: -2px;
    }
    cursor: pointer;
    height: 40px;
    display: grid;
    place-content: center;
    transition: background-color 150ms var(--plurid-ease), color 150ms var(--plurid-ease);

    border-top-left-radius: ${({ first }) => (first ? 'var(--plurid-radius)' : '0')};
    border-top-right-radius: ${({ first }) => (first ? 'var(--plurid-radius)' : '0')};
    border-bottom-left-radius: ${({ last }) => (last ? 'var(--plurid-radius)' : '0')};
    border-bottom-right-radius: ${({ last }) => (last ? 'var(--plurid-radius)' : '0')};

    @media (hover: hover) {
        &:hover {
            background: var(--plurid-hover);
        }

        &:hover svg {
            transform: ${({
                scaleImage,
            }) => {
                if (scaleImage) {
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
        fill: currentColor;
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
