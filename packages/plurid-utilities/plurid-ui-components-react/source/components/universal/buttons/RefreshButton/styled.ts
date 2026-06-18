// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledRefreshButton {
    theme: Theme;
}

const StyledRefreshButton = styled.div<IStyledRefreshButton>`
`;
// #endregion module



// #region exports
export {
    StyledRefreshButton,
};
// #endregion exports
