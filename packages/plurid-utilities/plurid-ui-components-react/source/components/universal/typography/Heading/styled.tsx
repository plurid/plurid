// #region imports
    // #region libraries
    import {
        styled,
    } from '~utilities/styled';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledHeading {
    theme: Theme;
}

export const StyledHeading1: any = styled.h1<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 2.2rem;
    margin: 1.4rem 0;
`;


export const StyledHeading2: any = styled.h2<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 2rem;
    margin: 1.2rem 0;
`;


export const StyledHeading3: any = styled.h3<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 1.8rem;
    margin: 1rem 0;
`;


export const StyledHeading4: any = styled.h4<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 1.6rem;
    margin: 1rem 0;
`;


export const StyledHeading5: any = styled.h5<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 1.4rem;
    margin: 1rem 0;
`;


export const StyledHeading6: any = styled.h5<IStyledHeading>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${props => props.theme.fontFamilySansSerif};
    font-size: 1.2rem;
    margin: 1rem 0;
`;
// #endregion module
