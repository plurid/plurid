// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        Sizes,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledParagraph {
    theme: Theme;
    size: Sizes;
    fontFamily: 'sans-serif' | 'serif';
}

export const StyledParagraph: any = styled.p<IStyledParagraph>`
    color: ${props => props.theme.colorPrimary};
    font-family: ${(props: IStyledParagraph) => {
        switch (props.fontFamily) {
            case 'sans-serif':
                return props.theme.fontFamilySansSerif;
            case 'serif':
                return props.theme.fontFamilySerif;
            default:
                return props.fontFamily;
        }
    }};
    font-size: ${(props: IStyledParagraph) => {
        switch (props.size) {
            case 'small':
                return '0.8rem';
            case 'normal':
                return '1rem';
            case 'large':
                return '1.2rem';
            default:
                return '1rem';
        }
    }};

    margin: 1.2rem 0;
    line-height: 1.4;
`;
// #endregion module
