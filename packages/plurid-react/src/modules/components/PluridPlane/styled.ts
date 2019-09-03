import styled from 'styled-components';



export const StyledPluridPlane: any = styled.div`
    position: absolute;
    height: auto;
    background-color: hsla(220, 10%, 40%, 0.4);
    width: ${(props: any) => {
        return props.viewSize.width + 'px';
    }};
`;
