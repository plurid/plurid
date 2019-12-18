import styled from 'styled-components';

import {
    decomposeColor,
} from '@plurid/plurid-themes';


export const StyledPluridPlane: any = styled.div`
    background-color: ${(props: any) => {
        if (props.transparentUI) {
            return props.theme.backgroundColorPrimaryAlpha;
        }

        if (props.planeOpacity !== 1) {
            const decomposedColor = decomposeColor(props.theme.backgroundColorPrimary);
            if (decomposedColor) {
                const color = `hsla(${decomposedColor.hue}, ${decomposedColor.saturation}%, ${decomposedColor.lightness}%, ${props.planeOpacity})`;
                return color;
            }
            return 'transparent';
        }
        return props.theme.backgroundColorPrimary;
    }};
    box-shadow: ${(props: any) => {
        if (props.planeOpacity === 0) {
            return 'none';
        }
        return props.theme.boxShadowUmbra;
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};
    opacity: ${(props: any) => {
        if (!props.show) {
            return '0';
        }
        return '1';
    }};

    position: absolute;
    height: auto;
    width: 100%;
    font-size: 0.9rem;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: ${(props: any) => {
        if (props.planeControls) {
            return '56px auto';
        }
        return 'auto';
    }};

    transform-origin: 0 0 0;
`;
