import styled from 'styled-components';



export const StyledPluridRoots = styled.div`
    transform-style: preserve-3d;
`;


export const StyledTransformOrigin = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorTertiaryAlpha;
    }};

    position: absolute;
    height: 15px;
    width: 15px;
    z-index: 999;
    border-radius: 100px;
`;
