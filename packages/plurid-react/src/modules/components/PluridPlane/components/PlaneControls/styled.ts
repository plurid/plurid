import styled from 'styled-components';



export const StyledPlaneControls = styled.div`
    background-color: ${(props: any) => {
        return props.theme.backgroundColorSecondary;
    }};

    width: 100%;
    display: grid;
    align-items: center;
    justify-content: center;
    grid-template-rows: 1fr;
`;
