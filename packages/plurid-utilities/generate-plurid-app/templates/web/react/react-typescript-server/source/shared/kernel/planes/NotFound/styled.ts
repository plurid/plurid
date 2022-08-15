// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledNotFound {
    theme: Theme;
}

export const StyledNotFound = styled.div`
    text-align: center;
    height: 100%;
    display: grid;
    place-content: center;
    min-height: 400px;
    font-family: ${
        ({
            theme,
        }: IStyledNotFound) => theme.fontFamilySansSerif
    };

    h1 {
        min-height: 60px;
    }
`;
// #endregion module
