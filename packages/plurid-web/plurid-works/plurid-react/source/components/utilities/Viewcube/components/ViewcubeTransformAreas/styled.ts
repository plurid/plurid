// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledViewcubeTransformTranslateX {
    theme: Theme;
}

export const StyledViewcubeTransformTranslateX = styled.div<IStyledViewcubeTransformTranslateX>`
    grid-area: PVTranslateX;
`;


export interface IStyledViewcubeTransformTranslateY {
    theme: Theme;
}

export const StyledViewcubeTransformTranslateY = styled.div<IStyledViewcubeTransformTranslateY>`
    grid-area: PVTranslateY;
`;


export interface IStyledViewcubeTransformScale {
    theme: Theme;
}

export const StyledViewcubeTransformScale = styled.div<IStyledViewcubeTransformScale>`
    grid-area: PVScale;
`;
// #region module
