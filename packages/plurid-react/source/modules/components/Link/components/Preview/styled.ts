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
    min-width: 600px;
    min-height: 300px;
    z-index: 99999;

    top: ${(properties: IStyledPreview) => {
        const location = properties.linkCoordinates.y;
        return location + 'px';
    }};
    left: ${(properties: IStyledPreview) => {
        const location = properties.linkCoordinates.x + 5;
        return location + 'px';
    }};
    background-color: ${(properties: IStyledPreview) => {
        return properties.theme.backgroundColorSecondary;
    }};
    box-shadow: ${(properties: IStyledPreview) => {
        return properties.theme.boxShadowUmbra;
    }};
`;
