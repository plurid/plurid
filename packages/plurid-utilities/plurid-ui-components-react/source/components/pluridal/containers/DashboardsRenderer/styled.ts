// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #region libraries
// #region imports



// #region module
export interface IStyledDashboardsRenderer {
    theme: Theme;
    compactSelectors: boolean;
    fullRenderArea: boolean;
}

export const StyledDashboardsRenderer = styled.div<IStyledDashboardsRenderer>`
    display: grid;
    grid-template-columns: ${
        ({
            fullRenderArea,
            compactSelectors,
        }: IStyledDashboardsRenderer) => {
            if (fullRenderArea) {
                return '1fr';
            }

            return compactSelectors
                ? '60px auto'
                : '1fr 4fr'
        }
    };
    min-height: 700px;
`;


export const StyledNoDashboardRender = styled.div`
    display: grid;
    place-content: center;
`;
// #region module
