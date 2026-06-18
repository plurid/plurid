// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledEntityPill {
    theme: Theme;
}

export const StyledEntityPill = styled.div<IStyledEntityPill>`
    background-color: ${
        ({
            theme,
        }: IStyledEntityPill) => theme.backgroundColorTertiary
    };
    box-shadow: ${
        ({
            theme,
        }: IStyledEntityPill) => theme.boxShadowUmbra
    };

    padding: 0.5rem 1rem;
    margin: 0.5rem;
    border-radius: 20px;

    display: flex;
    align-items: center;
`;
// #region module
