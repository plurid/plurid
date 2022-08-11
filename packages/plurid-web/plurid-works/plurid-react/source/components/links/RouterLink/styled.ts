// #region imports
    // #region libraries
    import styled, {
        css,
    } from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledPluridRouterLink {
    theme: Theme;
}

const commonStyle = css<IStyledPluridRouterLink>`
    color: ${({
        theme,
    }) => {
        return theme.colorTertiary;
    }};

    @media (hover:hover) {
        :hover {
            color: ${({
                theme,
            }) => {
                return theme.colorPrimary;
            }};
        }
    }
`;

export const StyledPluridRouterLinkAnchor = styled.a<IStyledPluridRouterLink>`
    ${commonStyle}
`;


export const StyledPluridRouterLinkDiv = styled.div<IStyledPluridRouterLink>`
    cursor: pointer;

    ${commonStyle}
`;
// #endregion module
