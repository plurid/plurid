import styled from 'styled-components';



export const StyledPluridPlane: any = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorPrimary;
    }};
    box-shadow: ${(props: any) => {
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

    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 34px auto;

    transform-origin: 0 0 0;
`;
