// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledHR {
    theme: Theme;
}

export const StyledHR = styled.hr<IStyledHR>`
    outline: 0;
    border: 0;
    margin: 0.8rem auto;
    height: 1px;

    background-color: ${
        ({
            theme,
        }: IStyledHR) => theme.colorPrimary
    };
`;
// #endregion module
