import styled from 'styled-components';



export const StyledPluridRoots = styled.div`
    transform-style: preserve-3d;
`;


export const StyledTransformOrigin = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorTertiaryAlpha;
    }};

    position: absolute;
    height: 5px;
    width: 5px;
    z-index: 999;
    border-radius: 100px;
`;
