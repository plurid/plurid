// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries
// #endregion imports



// #region module
export interface IStyledFormObliterate {
    theme: Theme,
    level: number;
    devisible: boolean;
}

export const StyledFormObliterate = styled.div<IStyledFormObliterate>`
    color: ${(properties: IStyledFormObliterate) => {
        return properties.theme.colorPrimary;
    }};
    font-family: ${(properties: IStyledFormObliterate) => {
        return properties.theme.fontFamilySansSerif;
    }};
    font-size: 0.8rem;
    user-select: none;
`;


export const StyledObliterateContainer = styled.div`
    text-align: center;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 30px 45px 60px;
    align-items: center;
    max-width: 200px;
    margin: 1rem auto;
`;
// #endregion module
