import styled from 'styled-components';



export const StyledPlaneControls = styled.div`
    /* background-color: hsl(220, 10%, 15%); */
    background-color: ${(props: any) => {
        return props.theme.backgroundColorTertiary;
    }};

    width: 100%;

    display: grid;
    align-items: center;
    grid-template-rows: 1fr;
`;
