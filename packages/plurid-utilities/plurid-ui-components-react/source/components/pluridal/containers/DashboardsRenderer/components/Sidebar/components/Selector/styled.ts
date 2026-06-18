// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledSelector {
    theme: Theme;
    selected: boolean;
    compactSelectors: boolean;
}

export const StyledSelector = styled.li<IStyledSelector>`
    background-color: ${
        ({
            theme,
            selected,
        }: IStyledSelector) => selected
            ? theme.backgroundColorPrimary
            : 'initial'
    };

    :hover {
        background-color: ${
            ({
                theme,
            }: IStyledSelector) => theme.backgroundColorPrimary
        };
    }

    display: grid;
    grid-template-columns: ${
        ({
            compactSelectors,
        }: IStyledSelector) => compactSelectors
            ? '16px'
            : '16px auto'
    };
    grid-gap: 0.7rem;
    min-height: 45px;
    align-items: center;
    position: relative;
`;


export interface IStyledSelectorRelativeLabel {
    theme: Theme;
}

export const StyledSelectorRelativeLabel = styled.div<IStyledSelectorRelativeLabel>`
    position: absolute;
    left: 50px;
    z-index: 9999;
    min-height: 45px;
    display: grid;
    align-items: center;
    padding-right: 0.5rem;
    background-color: ${
        ({
            theme,
        }: IStyledSelectorRelativeLabel) => theme.backgroundColorPrimaryAlpha
    };
`;
// #region module
