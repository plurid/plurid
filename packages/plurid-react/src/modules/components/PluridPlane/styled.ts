import styled from 'styled-components';



export const StyledPluridPlane: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorPrimary;
    }};
    box-shadow: 0 2px 2px 0 ${(props: any) => {
        return props.theme.shadow;
    }};
    color: ${(props: any) => {
        return props.theme.colorPrimary;
    }};

    position: absolute;
    height: auto;
    width: 100%;

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 34px auto;

    transform-origin: 0 0 0;
`;
