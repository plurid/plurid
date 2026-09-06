// #region imports
    // #region libraries
    import styled from 'styled-components';

    import {
        Z_INDEX,
    } from '~data/constants/zIndex';

    import {
        Theme,
    } from '@plurid/plurid-themes';
    // #endregion libraries


    // #region external
    import {
        PluridLinkCoordinates,
    } from '~data/interfaces';
    // #endregion external
// #endregion imports



// #region module
export interface IStyledPreview {
    theme: Theme;
    linkCoordinates: PluridLinkCoordinates;
}

export const StyledPluridPlanePreview = styled.div<IStyledPreview>`
    position: absolute;
    min-width: 600px;
    min-height: 300px;
    z-index: ${Z_INDEX.PREVIEW};

    top: ${({
        linkCoordinates,
    }) => {
        const location = linkCoordinates.y;
        return location + 'px';
    }};
    left: ${({
        linkCoordinates,
    }) => {
        const location = linkCoordinates.x + 5;
        return location + 'px';
    }};
    color: var(--plurid-ink);
    background-color: var(--plurid-surface-solid);
    border: 1px solid var(--plurid-rim);
    border-radius: var(--plurid-radius-panel);
    box-shadow: 0 0 0 1px var(--plurid-halo), var(--plurid-shadow);
`;
// #endregion module
