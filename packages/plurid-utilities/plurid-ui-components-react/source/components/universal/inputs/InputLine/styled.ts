// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledInputLine {
    theme: Theme;
}

export const StyledInputLine = styled.div<IStyledInputLine>`
    width: 350px;
`;
// #endregion module
