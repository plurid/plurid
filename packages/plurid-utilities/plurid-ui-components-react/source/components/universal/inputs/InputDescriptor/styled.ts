// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledInputDescriptor {
    theme: Theme;
}

export const StyledInputDescriptor = styled.div<IStyledInputDescriptor>`
    text-align: left;
    font-size: 0.9rem;
    line-height: 1;
    min-height: 1.1rem;
    margin-top: 1.3rem;
    margin-bottom: 0.4rem;
    margin-left: 0.9rem;

    font-family: ${
        ({
            theme,
        }: IStyledInputDescriptor) => theme.fontFamilySansSerif
    };
    color: ${
        ({
            theme,
        }: IStyledInputDescriptor) => theme.colorPrimary
    };
`;
// #endregion module
