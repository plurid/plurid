// #region imports
    // #region libraries
    import styled from 'styled-components';
    // #region libraries
// #region imports



// #region module
export interface IStyledFadeIn {
}

export const StyledFadeIn = styled.div<IStyledFadeIn>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: black;
    pointer-events: none;
    z-index: 999999;
`;
// #region module
