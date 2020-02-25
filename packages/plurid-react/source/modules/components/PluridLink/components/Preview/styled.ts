import styled from 'styled-components';

import {
    Theme,
} from '@plurid/plurid-themes';



interface IStyledPreview {
    theme: Theme;
    linkCoordinates: any;
}

export const StyledPreview = styled.div<IStyledPreview>`
    position: absolute;
    min-width: 300px;
    min-height: 200px;
    z-index: 99999;

    top: ${(properties: IStyledPreview) => {
        const location = properties.linkCoordinates.y + 5;
        return location + 'px';
    }};
    left: ${(properties: IStyledPreview) => {
        const location = properties.linkCoordinates.x + 5;
        return location + 'px';
    }};
    background-color: ${(properties: IStyledPreview) => {
        return properties.theme.backgroundColorPrimary;
    }};
    box-shadow: ${(properties: IStyledPreview) => {
        return properties.theme.boxShadowUmbra;
    }};
`;
