import styled from 'styled-components';

import {
    Theme,
} from '@plurid/plurid-themes';



interface IStyledPreview {
    theme: Theme;
}

export const StyledPreview = styled.div<IStyledPreview>`
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    min-width: 300px;
    min-height: 200px;
    z-index: 99999;

    background-color: ${(properties: IStyledPreview) => {
        return properties.theme.backgroundColorPrimary;
    }};
    box-shadow: ${(properties: IStyledPreview) => {
        return properties.theme.boxShadowUmbra;
    }};
`;
