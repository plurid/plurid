import styled from 'styled-components';

import {
    SIZES,
} from '@plurid/plurid-data';


export const StyledPluridRoots = styled.div`
    transform-style: preserve-3d;
`;


export const StyledTransformOrigin: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorTertiaryAlpha;
    }};
    height: ${(props: any) => {
        switch (props.transformOriginSize) {
            case SIZES.SMALL:
                return '5px';
            case SIZES.NORMAL:
                return '10px';
            case SIZES.LARGE:
                return '15px';
            default:
                return '10px';
        }
    }};
    width: ${(props: any) => {
        switch (props.transformOriginSize) {
            case SIZES.SMALL:
                return '5px';
            case SIZES.NORMAL:
                return '10px';
            case SIZES.LARGE:
                return '15px';
            default:
                return '10px';
        }
    }};

    position: absolute;
    z-index: 999;
    border-radius: 100px;
    user-select: none;
    pointer-events: none;
    touch-action: none;
`;
